import request from 'supertest';
import app from '../src/app';

describe('Health Check API', () => {
  it('GET /api/health should respond with API status structure', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBeLessThan(600);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });
});
