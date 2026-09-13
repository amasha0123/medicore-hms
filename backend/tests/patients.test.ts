import request from 'supertest';
import app from '../src/app';

describe('Patient API', () => {
  it('GET /api/v1/patients should require authentication', async () => {
    const res = await request(app).get('/api/v1/patients');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/patients should reject malformed JWT token', async () => {
    const res = await request(app)
      .get('/api/v1/patients')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/patients should require authentication', async () => {
    const res = await request(app)
      .post('/api/v1/patients')
      .send({ firstName: 'John', lastName: 'Doe' });
    expect(res.status).toBe(401);
  });
});
