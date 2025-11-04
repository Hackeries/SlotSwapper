import pool from '../config/database';

export enum SwapRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface SwapRequest {
  id: number;
  requester_id: number;
  requester_slot_id: number;
  target_user_id: number;
  target_slot_id: number;
  status: SwapRequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSwapRequestDTO {
  requester_id: number;
  requester_slot_id: number;
  target_user_id: number;
  target_slot_id: number;
}

export class SwapRequestModel {
  static async create(data: CreateSwapRequestDTO): Promise<SwapRequest> {
    const { requester_id, requester_slot_id, target_user_id, target_slot_id } = data;
    
    const result = await pool.query(
      `INSERT INTO swap_requests (requester_id, requester_slot_id, target_user_id, target_slot_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [requester_id, requester_slot_id, target_user_id, target_slot_id]
    );
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<SwapRequest | null> {
    const result = await pool.query(
      'SELECT * FROM swap_requests WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async findIncomingRequests(userId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        sr.*,
        u.name as requester_name,
        u.email as requester_email,
        e1.title as requester_slot_title,
        e1.start_time as requester_slot_start,
        e1.end_time as requester_slot_end,
        e2.title as target_slot_title,
        e2.start_time as target_slot_start,
        e2.end_time as target_slot_end
       FROM swap_requests sr
       JOIN users u ON sr.requester_id = u.id
       JOIN events e1 ON sr.requester_slot_id = e1.id
       JOIN events e2 ON sr.target_slot_id = e2.id
       WHERE sr.target_user_id = $1
       ORDER BY sr.created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  static async findOutgoingRequests(userId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        sr.*,
        u.name as target_name,
        u.email as target_email,
        e1.title as requester_slot_title,
        e1.start_time as requester_slot_start,
        e1.end_time as requester_slot_end,
        e2.title as target_slot_title,
        e2.start_time as target_slot_start,
        e2.end_time as target_slot_end
       FROM swap_requests sr
       JOIN users u ON sr.target_user_id = u.id
       JOIN events e1 ON sr.requester_slot_id = e1.id
       JOIN events e2 ON sr.target_slot_id = e2.id
       WHERE sr.requester_id = $1
       ORDER BY sr.created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  static async updateStatus(id: number, status: SwapRequestStatus): Promise<SwapRequest | null> {
    const result = await pool.query(
      'UPDATE swap_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return result.rows[0] || null;
  }
}
