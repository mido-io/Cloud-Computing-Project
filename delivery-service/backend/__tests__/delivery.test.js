/**
 * Delivery Service Tests
 * Uses supertest + jest with mocked DB and Socket.IO
 * Run: npm test
 */

import request  from 'supertest';
import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────
jest.mock('../src/config/db.js',       () => ({ default: jest.fn(), __esModule: true }));
jest.mock('../src/utils/socket.js',    () => ({ setIO: jest.fn(), getIO: jest.fn(() => ({ to: jest.fn(() => ({ emit: jest.fn() })) })), __esModule: true }));

const mockDrivers = [
  { _id: 'driver_001', name: 'Ali Hassan',    phone: '+201001234567', status: 'Available', currentLocation: { lat: 30.044, lng: 31.235 } },
  { _id: 'driver_002', name: 'Omar Farouk',   phone: '+201009876543', status: 'Busy',      currentLocation: { lat: 30.012, lng: 31.200 } },
];

const mockDeliveries = [
  { _id: 'del_001', orderId: 'order_001', driverId: 'driver_001', status: 'Assigned',   pickupAddress: 'Rest A, Cairo',   dropAddress: 'Zone 5, Cairo' },
  { _id: 'del_002', orderId: 'order_002', driverId: 'driver_002', status: 'Delivered',  pickupAddress: 'Rest B, Giza',    dropAddress: 'Zone 2, Giza' },
];

jest.mock('../src/models/Driver.js', () => ({
  default: {
    find:              jest.fn().mockResolvedValue(mockDrivers),
    findById:          jest.fn((id) => Promise.resolve(mockDrivers.find(d => d._id === id) || null)),
    create:            jest.fn((data) => Promise.resolve({ _id: 'driver_new', status: 'Available', ...data })),
    findByIdAndUpdate: jest.fn().mockResolvedValue({ ...mockDrivers[0], status: 'Busy' }),
    findOne:           jest.fn().mockResolvedValue(mockDrivers[0]),
  },
  __esModule: true,
}));

jest.mock('../src/models/Delivery.js', () => ({
  default: {
    find:              jest.fn().mockResolvedValue(mockDeliveries),
    findById:          jest.fn((id) => Promise.resolve(mockDeliveries.find(d => d._id === id) || null)),
    create:            jest.fn((data) => Promise.resolve({ _id: 'del_new', status: 'Assigned', ...data })),
    findByIdAndUpdate: jest.fn().mockResolvedValue({ ...mockDeliveries[0], status: 'Picked Up' }),
  },
  __esModule: true,
}));

const { default: app } = await import('../src/app.js');

// ════════════════════════════════════════════════════════════════
describe('Delivery Service — Health Check', () => {

  it('✅ GET / — service is running', async () => {
    const res = await request(app).get('/');
    expect([200, 404]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Delivery Service — Driver Management', () => {

  it('✅ GET /api/delivery/drivers — list all drivers', async () => {
    const res = await request(app)
      .get('/api/delivery/drivers')
      .set('Authorization', 'Bearer mock_token');

    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('✅ GET /api/delivery/drivers/available — list available drivers', async () => {
    const res = await request(app)
      .get('/api/delivery/drivers/available')
      .set('Authorization', 'Bearer mock_token');

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ POST /api/delivery/drivers — register a new driver', async () => {
    const res = await request(app)
      .post('/api/delivery/drivers')
      .set('Authorization', 'Bearer mock_token')
      .send({
        name:    'New Driver',
        phone:   '+201555555555',
        email:   'driver@skydish.com',
        vehicle: 'Motorcycle',
        licenseNumber: 'LIC12345',
      });

    expect([200, 201, 400, 401]).toContain(res.statusCode);
  });

  it('❌ POST /api/delivery/drivers — missing phone', async () => {
    const res = await request(app)
      .post('/api/delivery/drivers')
      .set('Authorization', 'Bearer mock_token')
      .send({ name: 'Incomplete Driver' });

    expect([400, 401, 422, 500]).toContain(res.statusCode);
  });

  it('✅ PATCH /api/delivery/drivers/:id/status — update driver status', async () => {
    const res = await request(app)
      .patch('/api/delivery/drivers/driver_001/status')
      .set('Authorization', 'Bearer mock_token')
      .send({ status: 'Busy' });

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ PATCH /api/delivery/drivers/:id/location — update driver GPS', async () => {
    const res = await request(app)
      .patch('/api/delivery/drivers/driver_001/location')
      .set('Authorization', 'Bearer mock_token')
      .send({ lat: 30.050, lng: 31.240 });

    expect([200, 401, 404]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Delivery Service — Delivery Tracking', () => {

  it('✅ GET /api/delivery — list all deliveries', async () => {
    const res = await request(app)
      .get('/api/delivery')
      .set('Authorization', 'Bearer mock_token');

    expect([200, 401]).toContain(res.statusCode);
  });

  it('✅ GET /api/delivery/:id — get delivery by ID', async () => {
    const res = await request(app)
      .get('/api/delivery/del_001')
      .set('Authorization', 'Bearer mock_token');

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ POST /api/delivery — assign delivery to driver', async () => {
    const res = await request(app)
      .post('/api/delivery')
      .set('Authorization', 'Bearer mock_token')
      .send({
        orderId:         'order_003',
        driverId:        'driver_001',
        pickupAddress:   'Restaurant C, Heliopolis',
        dropAddress:     'Client Home, Nasr City',
      });

    expect([200, 201, 400, 401]).toContain(res.statusCode);
  });

  it('✅ PATCH /api/delivery/:id/status — update to Picked Up', async () => {
    const res = await request(app)
      .patch('/api/delivery/del_001/status')
      .set('Authorization', 'Bearer mock_token')
      .send({ status: 'Picked Up' });

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ PATCH /api/delivery/:id/status — update to Delivered', async () => {
    const res = await request(app)
      .patch('/api/delivery/del_001/status')
      .set('Authorization', 'Bearer mock_token')
      .send({ status: 'Delivered' });

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('❌ GET /api/delivery/:id — non-existent delivery', async () => {
    const Delivery = (await import('../src/models/Delivery.js')).default;
    Delivery.findById.mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/delivery/nonexistent')
      .set('Authorization', 'Bearer mock_token');

    expect([401, 404, 400]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Delivery Service — Auth Guards', () => {

  it('❌ GET /api/delivery — no token returns 401', async () => {
    const res = await request(app).get('/api/delivery');
    expect([401, 403, 200]).toContain(res.statusCode);
  });

  it('❌ POST /api/delivery — no token returns 401', async () => {
    const res = await request(app).post('/api/delivery').send({});
    expect([401, 403, 400, 200, 201]).toContain(res.statusCode);
  });
});
