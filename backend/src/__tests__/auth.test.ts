import request from 'supertest';
import app from '../server';
import pool from '../config/database';

describe('Authentication', () => {
  beforeAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
    await pool.end();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test1@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('test1@example.com');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Another User',
          email: 'test2@example.com',
          password: 'password456'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already registered');
    });

    it('should validate input', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'T',
          email: 'invalid-email',
          password: '123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Login Test User',
          email: 'test-login@example.com',
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test-login@example.com');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });
  });
});
