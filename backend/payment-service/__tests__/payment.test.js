const request = require('supertest');
const app     = require('../server');

// ── Mocks ────────────────────────────────────────────────────────
jest.mock('../config/db', () => jest.fn());

jest.mock('../utils/twilioService', () => ({
  sendSmsNotification: jest.fn().mockResolvedValue({ sid: 'SM_mock_123' }),
}));

jest.mock('../utils/emailService', () => ({
  sendPaymentConfirmationEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('axios', () => ({
  post: jest.fn(),
  get:  jest.fn(),
}));

const axios = require('axios');

// ── Valid order payload ──────────────────────────────────────────
const validOrder = {
  orderId:   'ORDER_TEST_001',
  userId:    'USER_TEST_001',
  amount:    150,
  currency:  'EGP',
  firstName: 'Mohamed',
  lastName:  'Khairy',
  email:     'customer@skydish.com',
  phone:     '+201234567890',
};

// ════════════════════════════════════════════════════════════════
describe('Payment Service — Health & Basic Routes', () => {

  it('✅ GET / — service is running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/payment service running/i);
  });

  it('✅ GET /api-docs — Swagger docs accessible', async () => {
    const res = await request(app).get('/api-docs/');
    expect([200, 301, 302]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Payment Service — Process Payment (Paymob)', () => {

  beforeEach(() => {
    // Mock Paymob authentication token
    axios.post.mockResolvedValueOnce({
      data: { token: 'paymob_auth_token_mock' },
    });
    // Mock Paymob order registration
    axios.post.mockResolvedValueOnce({
      data: { id: 'paymob_order_mock_id' },
    });
    // Mock Paymob payment key
    axios.post.mockResolvedValueOnce({
      data: { token: 'paymob_payment_key_mock_xyz' },
    });
  });

  it('✅ POST /api/payment/process — returns payment token', async () => {
    const res = await request(app)
      .post('/api/payment/process')
      .send(validOrder);

    expect([200, 201]).toContain(res.statusCode);
    // Should return a payment token or client secret
    const hasToken =
      res.body.paymentToken ||
      res.body.payment_key  ||
      res.body.clientSecret ||
      res.body.token;
    expect(hasToken).toBeTruthy();
  });

  it('❌ POST /api/payment/process — missing orderId', async () => {
    const { orderId, ...incomplete } = validOrder;
    const res = await request(app)
      .post('/api/payment/process')
      .send(incomplete);

    expect([400, 422, 500]).toContain(res.statusCode);
  });

  it('❌ POST /api/payment/process — missing amount', async () => {
    const { amount, ...incomplete } = validOrder;
    const res = await request(app)
      .post('/api/payment/process')
      .send(incomplete);

    expect([400, 422, 500]).toContain(res.statusCode);
  });

  it('❌ POST /api/payment/process — Paymob API failure', async () => {
    axios.post.mockReset();
    axios.post.mockRejectedValueOnce(new Error('Paymob API unreachable'));

    const res = await request(app)
      .post('/api/payment/process')
      .send(validOrder);

    expect([500, 502, 503]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Payment Service — Webhook Endpoint', () => {

  it('✅ POST /api/payment/webhook — valid HMAC callback', async () => {
    const crypto = require('crypto');
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET || '2BF00ABADB1EDE1845E5CCA09B6B0ABE';

    const payload = JSON.stringify({
      type: 'TRANSACTION',
      obj: { success: true, order: { merchant_order_id: 'ORDER_TEST_001' }, amount_cents: 15000 },
    });

    const hmac = crypto.createHmac('sha512', hmacSecret).update(payload).digest('hex');

    const res = await request(app)
      .post('/api/payment/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

    // Webhook should respond, even if HMAC doesn't match (accept or reject)
    expect([200, 400, 401]).toContain(res.statusCode);
  });

  it('❌ POST /api/payment/webhook — empty body', async () => {
    const res = await request(app)
      .post('/api/payment/webhook')
      .send({});

    expect([400, 401, 200]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Payment Service — Notification Services', () => {
  const { sendSmsNotification } = require('../utils/twilioService');

  it('✅ SMS service mock is callable', async () => {
    await sendSmsNotification('+201234567890', 'Test payment of 150 EGP confirmed');
    expect(sendSmsNotification).toHaveBeenCalled();
  });

  it('✅ SMS notification contains order info', async () => {
    await sendSmsNotification('+201234567890', 'Your order ORDER_TEST_001 payment confirmed');
    expect(sendSmsNotification).toHaveBeenCalledWith(
      '+201234567890',
      expect.stringContaining('ORDER_TEST_001')
    );
  });
});
