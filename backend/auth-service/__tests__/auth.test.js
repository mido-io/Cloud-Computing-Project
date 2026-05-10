const request = require('supertest');
const app     = require('../server');

// ── Mock DB & JWT so tests run without a real MongoDB ──────────
jest.mock('../config/db', () => jest.fn());

jest.mock('../models/Customer', () => {
  const customers = {};

  const CustomerMock = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this._id  = 'mock_id_123';
    this.save = jest.fn().mockResolvedValue(this);
  });

  CustomerMock.findOne = jest.fn(({ email }) => ({
    select: jest.fn().mockResolvedValue(
      customers[email]
        ? { ...customers[email], comparePassword: jest.fn().mockResolvedValue(true) }
        : null
    ),
  }));

  CustomerMock.create = jest.fn((data) => {
    customers[data.email] = { ...data, _id: 'mock_id_123' };
    return Promise.resolve({ ...data, _id: 'mock_id_123' });
  });

  CustomerMock.findById = jest.fn().mockResolvedValue({
    _id: 'mock_id_123',
    firstName: 'Mohamed',
    lastName: 'Khairy',
    email: 'test@skydish.com',
    phone: '+201234567890',
    location: 'Cairo',
  });

  CustomerMock.findByIdAndUpdate = jest.fn().mockResolvedValue({
    _id: 'mock_id_123',
    firstName: 'Updated',
    lastName: 'Name',
    email: 'test@skydish.com',
    phone: '+201234567890',
    location: 'Alexandria',
  });

  return CustomerMock;
});

// ── Test data ────────────────────────────────────────────────────
const validUser = {
  firstName: 'Mohamed',
  lastName:  'Khairy',
  email:     'test@skydish.com',
  phone:     '+201234567890',
  password:  'SkyDish123!',
  location:  'Cairo, Egypt',
};

// ════════════════════════════════════════════════════════════════
describe('Auth Service — Customer Registration', () => {

  it('✅ POST /api/auth/register/customer — should register successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register/customer')
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.customer.email).toBe(validUser.email);
    expect(res.body.data.customer).not.toHaveProperty('password');
  });

  it('❌ POST /api/auth/register/customer — missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register/customer')
      .send({ email: 'test@skydish.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('❌ POST /api/auth/register/customer — duplicate email', async () => {
    const Customer = require('../models/Customer');
    Customer.create.mockRejectedValueOnce({ code: 11000 });

    const res = await request(app)
      .post('/api/auth/register/customer')
      .send(validUser);

    // Either 409 conflict or 500 depending on error handling
    expect([409, 500]).toContain(res.statusCode);
  });

  it('❌ POST /api/auth/register/customer — empty body', async () => {
    const res = await request(app)
      .post('/api/auth/register/customer')
      .send({});

    expect(res.statusCode).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Auth Service — Customer Login', () => {

  it('✅ POST /api/auth/login — valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.customer.email).toBe(validUser.email);
  });

  it('❌ POST /api/auth/login — wrong email (user not found)', async () => {
    const Customer = require('../models/Customer');
    Customer.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@skydish.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('❌ POST /api/auth/login — wrong password', async () => {
    const Customer = require('../models/Customer');
    Customer.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        _id: 'mock_id_123',
        email: validUser.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      }),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('❌ POST /api/auth/login — missing email or password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email });

    expect(res.statusCode).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Auth Service — Protected Profile Routes', () => {

  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    token = res.body.token;
  });

  it('✅ GET /api/auth/customer/profile — with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/customer/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.customer).toHaveProperty('email');
  });

  it('❌ GET /api/auth/customer/profile — no token (401)', async () => {
    const res = await request(app)
      .get('/api/auth/customer/profile');

    expect(res.statusCode).toBe(401);
  });

  it('❌ GET /api/auth/customer/profile — invalid/tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/customer/profile')
      .set('Authorization', 'Bearer invalidtokenxyz');

    expect(res.statusCode).toBe(401);
  });

  it('✅ PATCH /api/auth/customer/profile — update location', async () => {
    const res = await request(app)
      .patch('/api/auth/customer/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ location: 'Alexandria, Egypt' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.customer.location).toBe('Alexandria');
  });
});
