import request from 'supertest';
import app from '../src/app';

describe('Auth API Validation', () => {
  it('POST /api/v1/auth/login should reject empty credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/v1/auth/login should reject invalid email format', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'not-an-email',
      password: 'password'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Registration API Validation', () => {
  it('POST /api/v1/auth/register should reject empty payload', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/v1/auth/register should reject invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'not-an-email',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should reject mismatched passwords', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@medicore.hospital',
      password: 'Password@123',
      confirmPassword: 'DifferentPassword@456'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should reject short username', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      username: 'jd',
      email: 'john.doe@medicore.hospital',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should reject short password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@medicore.hospital',
      password: 'short',
      confirmPassword: 'short'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should reject username with spaces', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      username: 'john doe',
      email: 'john.doe@medicore.hospital',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
