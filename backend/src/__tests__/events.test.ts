import request from 'supertest';
import app from '../server';
import pool from '../config/database';

describe('Events', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    // Clean up and create test user
    await pool.query('DELETE FROM users WHERE email = $1', ['test-events@example.com']);
    
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Events Test User',
        email: 'test-events@example.com',
        password: 'password123'
      });

    token = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['test-events@example.com']);
    await pool.end();
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Team Meeting',
          start_time: '2025-11-05T10:00:00Z',
          end_time: '2025-11-05T11:00:00Z',
          status: 'BUSY'
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Team Meeting');
      expect(res.body.user_id).toBe(userId);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Meeting',
          start_time: '2025-11-05T10:00:00Z',
          end_time: '2025-11-05T11:00:00Z'
        });

      expect(res.status).toBe(401);
    });

    it('should validate time range', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Invalid Meeting',
          start_time: '2025-11-05T11:00:00Z',
          end_time: '2025-11-05T10:00:00Z'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/events', () => {
    it('should get all user events', async () => {
      const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/events/:id', () => {
    let eventId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Update Test',
          start_time: '2025-11-06T10:00:00Z',
          end_time: '2025-11-06T11:00:00Z'
        });
      eventId = res.body.id;
    });

    it('should update an event', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'SWAPPABLE'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('SWAPPABLE');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Delete Test',
          start_time: '2025-11-07T10:00:00Z',
          end_time: '2025-11-07T11:00:00Z'
        });

      const res = await request(app)
        .delete(`/api/events/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});
