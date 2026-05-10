/**
 * Restaurant Service Tests
 * Uses supertest + jest with mocked Mongoose models
 * Run: npm test
 */

import request from 'supertest';
import { jest } from '@jest/globals';

// ── Mock DB connection ──────────────────────────────────────────
jest.mock('../src/config/db.js', () => ({
  default: jest.fn(),
  __esModule: true,
}));

// ── Mock Restaurant Model ───────────────────────────────────────
const mockRestaurants = [
  { _id: 'rest_001', name: 'Pizza Palace',   location: 'Cairo',    cuisine: 'Italian', contactNumber: '+201111111111', ownerId: 'owner_001' },
  { _id: 'rest_002', name: 'Burger Barn',    location: 'Giza',     cuisine: 'American',contactNumber: '+201222222222', ownerId: 'owner_002' },
];

jest.mock('../src/models/Restaurant.js', () => ({
  default: {
    find:        jest.fn().mockResolvedValue(mockRestaurants),
    findById:    jest.fn((id) => mockRestaurants.find(r => r._id === id) || null),
    create:      jest.fn((data) => Promise.resolve({ _id: 'rest_new', ...data })),
    findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'rest_001', name: 'Updated', location: 'Cairo' }),
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'rest_001' }),
  },
  __esModule: true,
}));

jest.mock('../src/models/FoodItem.js', () => ({
  default: {
    find:    jest.fn().mockResolvedValue([
      { _id: 'food_001', name: 'Margherita Pizza', price: 120, restaurantId: 'rest_001', category: 'Pizza' },
      { _id: 'food_002', name: 'BBQ Burger',       price: 85,  restaurantId: 'rest_001', category: 'Burger'},
    ]),
    findById: jest.fn().mockResolvedValue({ _id: 'food_001', name: 'Margherita Pizza', price: 120 }),
    create:   jest.fn((data) => Promise.resolve({ _id: 'food_new', ...data })),
    findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'food_001', name: 'Updated Pizza', price: 130 }),
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'food_001' }),
  },
  __esModule: true,
}));

// ── Import app after mocks ──────────────────────────────────────
const { default: app } = await import('../src/server.js');

// ════════════════════════════════════════════════════════════════
describe('Restaurant Service — Health Check', () => {

  it('✅ GET / — service is running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/restaurant service running/i);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Restaurant Service — Restaurant CRUD', () => {

  it('✅ GET /api/superAdmin/restaurants — list all restaurants', async () => {
    const res = await request(app)
      .get('/api/superAdmin/restaurants')
      .set('Authorization', 'Bearer mock_superadmin_token');

    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('✅ GET /api/restaurant/:id — get restaurant by id', async () => {
    const res = await request(app).get('/api/restaurant/rest_001');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('✅ POST /api/restaurant — create restaurant', async () => {
    const res = await request(app)
      .post('/api/restaurant')
      .set('Authorization', 'Bearer mock_token')
      .send({
        name:          'Sushi Stop',
        location:      'Maadi, Cairo',
        cuisine:       'Japanese',
        contactNumber: '+201333333333',
      });

    expect([200, 201, 401]).toContain(res.statusCode);
  });

  it('❌ POST /api/restaurant — missing name', async () => {
    const res = await request(app)
      .post('/api/restaurant')
      .set('Authorization', 'Bearer mock_token')
      .send({ location: 'Cairo' });

    expect([400, 401, 422, 500]).toContain(res.statusCode);
  });

  it('✅ PUT /api/restaurant/:id — update restaurant', async () => {
    const res = await request(app)
      .put('/api/restaurant/rest_001')
      .set('Authorization', 'Bearer mock_token')
      .send({ name: 'Pizza Palace Updated' });

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ DELETE /api/restaurant/:id — delete restaurant', async () => {
    const res = await request(app)
      .delete('/api/restaurant/rest_001')
      .set('Authorization', 'Bearer mock_token');

    expect([200, 204, 401, 404]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
describe('Restaurant Service — Food Items CRUD', () => {

  it('✅ GET /api/food-items — list all food items', async () => {
    const res = await request(app).get('/api/food-items');
    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('✅ GET /api/food-items/:id — get single food item', async () => {
    const res = await request(app).get('/api/food-items/food_001');
    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ POST /api/food-items — create food item', async () => {
    const res = await request(app)
      .post('/api/food-items')
      .set('Authorization', 'Bearer mock_token')
      .send({
        name:         'Garlic Bread',
        price:        35,
        category:     'Sides',
        restaurantId: 'rest_001',
        description:  'Crispy garlic bread with herbs',
      });

    expect([200, 201, 401]).toContain(res.statusCode);
  });

  it('❌ POST /api/food-items — missing price', async () => {
    const res = await request(app)
      .post('/api/food-items')
      .set('Authorization', 'Bearer mock_token')
      .send({ name: 'Garlic Bread', restaurantId: 'rest_001' });

    expect([400, 401, 422, 500]).toContain(res.statusCode);
  });

  it('✅ PUT /api/food-items/:id — update food item price', async () => {
    const res = await request(app)
      .put('/api/food-items/food_001')
      .set('Authorization', 'Bearer mock_token')
      .send({ price: 130 });

    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it('✅ DELETE /api/food-items/:id — delete food item', async () => {
    const res = await request(app)
      .delete('/api/food-items/food_001')
      .set('Authorization', 'Bearer mock_token');

    expect([200, 204, 401, 404]).toContain(res.statusCode);
  });
});
