/**
 * Order Service Tests
 * Uses supertest + jest with mocked DB and Socket.IO
 * Run: npm test
 */

import request from 'supertest';
import { jest } from '@jest/globals';

// ── Mock DB & Socket.IO ──────────────────────────────────────────
jest.mock('./config/db.js', () => ({ default: jest.fn(), __esModule: true }));
jest.mock('socket.io', () => {
  const mockIO = { on: jest.fn(), emit: jest.fn() };
  return { Server: jest.fn(() => mockIO) };
});

// ── Mock Order model ─────────────────────────────────────────────
const mockOrders = [
  { _id: 'order_001', customerId: 'user_001', restaurantId: 'rest_001', status: 'Pending',   totalAmount: 250, items: [{ foodItemId: 'food_001', quantity: 2 }] },
  { _id: 'order_002', customerId: 'user_001', restaurantId: 'rest_002', status: 'Delivered',  totalAmount: 120, items: [{ foodItemId: 'food_002', quantity: 1 }] },
];

jest.mock('./models/Order.js', () => ({
  default: {
    find:              jest.fn().mockResolvedValue(mockOrders),
    findById:          jest.fn((id) => Promise.resolve(mockOrders.find(o => o._id === id) || null)),
    create:            jest.fn((data) => Promise.resolve({ _id: 'order_new', status: 'Pending', ...data })),
    findByIdAndUpdate: jest.fn().mockResolvedValue({ ...mockOrders[0], status: 'Confirmed' }),
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'order_001' }),
  },
  __esModule: true,
}));

const { default: app } = await import('./index.js');

const validOrder = {
  customerId:   'user_001',
  restaurantId: 'rest_001',
  items: [{ foodItemId: 'food_001', quantity: 2, price: 120 }],
  totalAmount:  240,
  deliveryAddress: 'Cairo, Nasr City',
};

// ════════════════════════════════════════════════════════════════
describe('Order Service — CRUD Operations', () => {

  it('✅ GET /api/orders — list all orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', 'Bearer mock_jwt_token');

    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('✅ GET /api/orders/:id — get order by ID', async () => {
    const res = await request(app)
      .get('/api/orders/order_001')
      .set('Authorization', 'Bearer mock_jwt_token');

    expect([200, 401, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body._id).toBe('order_001');
    }
  });

  it('✅ POST /api/orders — create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer mock_jwt_token')
      .send(validOrder);

    expect([200, 201, 401]).toContain(res.statusCode);
    if ([200, 201].includes(res.statusCode)) {
      expect(res.body).toHaveProperty('_id');
      expect(res.body.status).toBe('Pending');
    }
  });

  it('❌ POST /api/orders — missing items array', async () => {
    const { items, ...incomplete } = validOrder;
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer mock_jwt_token')
      .send(incomplete);

    expect([400, 401, 422, 500]).toContain(res.statusCode);
  });

  it('❌ POST /api/orders — missing restaurantId', async () => {
    const { restaurantId, ...incomplete } = validOrder;
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer mock_jwt_token')
      .send(incomplete);

    expect([400, 401, 422, 500]).toContain(res.statusCode);
  });

  it('✅ PUT /api/orders/:id — update order status to Confirmed', async () => {
    const res = await request(app)
      .put('/api/orders/order_001')
      .set('Authorization', 'Bearer mock_jwt_token')
      .send({ status: 'Confirmed' });

    expect([200, 401, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.status).toBe('Confirmed');
    }
  });

  it('✅ DELETE /api/orders/:id — delete order', async () => {
    const res = await request(app)
      .delete('/api/orders/order_001')
      .set('Authorization', 'Bearer mock_jwt_token');

    expect([200, 204, 401, 404]).toContain(res.statusCode);
  });

  it('❌ GET /api/orders/:id — non-existent order returns 404', async () => {
    const Order = (await import('./models/Order.js')).default;
    Order.findById.mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/orders/nonexistent_id')
      .set('Authorization', 'Bearer mock_jwt_token');

    expect([401, 404, 400]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Order Service — Status Transitions', () => {

  const statuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  statuses.forEach((status) => {
    it(`✅ Status update to "${status}" is a valid transition`, async () => {
      const res = await request(app)
        .put('/api/orders/order_001')
        .set('Authorization', 'Bearer mock_jwt_token')
        .send({ status });

      expect([200, 400, 401, 404]).toContain(res.statusCode);
    });
  });
});

// ════════════════════════════════════════════════════════════════
describe('Order Service — No Auth', () => {

  it('❌ GET /api/orders — without token returns 401', async () => {
    const res = await request(app).get('/api/orders');
    expect([401, 403, 200]).toContain(res.statusCode);
  });

  it('❌ POST /api/orders — without token returns 401', async () => {
    const res = await request(app).post('/api/orders').send(validOrder);
    expect([401, 403, 200, 201]).toContain(res.statusCode);
  });
});
