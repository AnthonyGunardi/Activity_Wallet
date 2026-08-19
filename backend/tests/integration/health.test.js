const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/config/database');

describe('Health Check API Integration', () => {
  test('GET /api/v1/health should return 200 with healthy status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('status', 'healthy');
    expect(response.body.data).toHaveProperty('database', 'connected');
    expect(response.body.data).toHaveProperty('timestamp');
  });

  test('GET /api/v1/health should reflect database disconnected state when connection fails', async () => {
    const originalTestConnection = database.testConnection;
    database.testConnection = jest.fn().mockResolvedValueOnce(false);

    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.data.database).toBe('disconnected');

    database.testConnection = originalTestConnection;
  });

  test('GET /api/v1/non-existent-route should return 404 with error envelope', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
  });
});
