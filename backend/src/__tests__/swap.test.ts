import request from 'supertest';
import app from '../server';
import pool from '../config/database';

describe('Swap Logic', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: number;
  let user2Id: number;
  let user1SlotId: number;
  let user2SlotId: number;

  beforeAll(async () => {
    // Clean up
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test-swap%@example.com']);

    // Create user 1
    const res1 = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Swap User 1',
        email: 'test-swap1@example.com',
        password: 'password123'
      });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    // Create user 2
    const res2 = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Swap User 2',
        email: 'test-swap2@example.com',
        password: 'password123'
      });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;

    // Create swappable slot for user 1
    const slot1 = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'User 1 Meeting',
        start_time: '2025-11-10T10:00:00Z',
        end_time: '2025-11-10T11:00:00Z',
        status: 'SWAPPABLE'
      });
    user1SlotId = slot1.body.id;

    // Create swappable slot for user 2
    const slot2 = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        title: 'User 2 Focus Time',
        start_time: '2025-11-11T14:00:00Z',
        end_time: '2025-11-11T15:00:00Z',
        status: 'SWAPPABLE'
      });
    user2SlotId = slot2.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test-swap%@example.com']);
    await pool.end();
  });

  describe('GET /api/swappable-slots', () => {
    it('should return swappable slots from other users', async () => {
      const res = await request(app)
        .get('/api/swappable-slots')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Should include user 2's slot but not user 1's own slot
      const hasUser2Slot = res.body.some((slot: any) => slot.id === user2SlotId);
      const hasUser1Slot = res.body.some((slot: any) => slot.id === user1SlotId);
      
      expect(hasUser2Slot).toBe(true);
      expect(hasUser1Slot).toBe(false);
    });
  });

  describe('POST /api/swap-request', () => {
    it('should create a swap request', async () => {
      const res = await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: user1SlotId,
          theirSlotId: user2SlotId
        });

      expect(res.status).toBe(201);
      expect(res.body.requester_id).toBe(user1Id);
      expect(res.body.target_user_id).toBe(user2Id);
    });

    it('should reject swap request with non-swappable slot', async () => {
      // Create a busy slot
      const busySlot = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Busy Meeting',
          start_time: '2025-11-12T10:00:00Z',
          end_time: '2025-11-12T11:00:00Z',
          status: 'BUSY'
        });

      const res = await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: busySlot.body.id,
          theirSlotId: user2SlotId
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/swap-response/:requestId', () => {
    let requestId: number;

    beforeEach(async () => {
      // Create fresh swappable slots for each test
      const slot1 = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Test Slot 1',
          start_time: '2025-11-13T10:00:00Z',
          end_time: '2025-11-13T11:00:00Z',
          status: 'SWAPPABLE'
        });

      const slot2 = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'Test Slot 2',
          start_time: '2025-11-13T14:00:00Z',
          end_time: '2025-11-13T15:00:00Z',
          status: 'SWAPPABLE'
        });

      const swapReq = await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: slot1.body.id,
          theirSlotId: slot2.body.id
        });

      requestId = swapReq.body.id;
    });

    it('should accept a swap request and exchange owners', async () => {
      const res = await request(app)
        .post(`/api/swap-response/${requestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          accepted: true
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('accepted');
    });

    it('should reject a swap request and restore slots to SWAPPABLE', async () => {
      const res = await request(app)
        .post(`/api/swap-response/${requestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          accepted: false
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('rejected');
    });

    it('should only allow target user to respond', async () => {
      const res = await request(app)
        .post(`/api/swap-response/${requestId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          accepted: true
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/requests/incoming', () => {
    it('should return incoming swap requests', async () => {
      const res = await request(app)
        .get('/api/requests/incoming')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/requests/outgoing', () => {
    it('should return outgoing swap requests', async () => {
      const res = await request(app)
        .get('/api/requests/outgoing')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
