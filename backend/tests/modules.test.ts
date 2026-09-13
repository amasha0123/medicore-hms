import request from 'supertest';
import app from '../src/app';

describe('Appointment API', () => {
  it('GET /api/v1/appointments should require authentication', async () => {
    const res = await request(app).get('/api/v1/appointments');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/appointments should require authentication', async () => {
    const res = await request(app).post('/api/v1/appointments').send({});
    expect(res.status).toBe(401);
  });
});

describe('Doctor API', () => {
  it('GET /api/v1/doctors should require authentication', async () => {
    const res = await request(app).get('/api/v1/doctors');
    expect(res.status).toBe(401);
  });
});

describe('Department API', () => {
  it('GET /api/v1/departments should require authentication', async () => {
    const res = await request(app).get('/api/v1/departments');
    expect(res.status).toBe(401);
  });
});

describe('Lab API', () => {
  it('GET /api/v1/laboratory should require authentication', async () => {
    const res = await request(app).get('/api/v1/laboratory');
    expect(res.status).toBe(401);
  });
});

describe('Pharmacy API', () => {
  it('GET /api/v1/pharmacy/medicines should require authentication', async () => {
    const res = await request(app).get('/api/v1/pharmacy/medicines');
    expect(res.status).toBe(401);
  });
});

describe('Billing API', () => {
  it('GET /api/v1/billing should require authentication', async () => {
    const res = await request(app).get('/api/v1/billing');
    expect(res.status).toBe(401);
  });
});
