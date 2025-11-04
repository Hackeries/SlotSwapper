import pool from '../config/database';

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

export interface Event {
  id: number;
  user_id: number;
  title: string;
  start_time: Date;
  end_time: Date;
  status: EventStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventDTO {
  user_id: number;
  title: string;
  start_time: Date;
  end_time: Date;
  status?: EventStatus;
}

export interface UpdateEventDTO {
  title?: string;
  start_time?: Date;
  end_time?: Date;
  status?: EventStatus;
}

export class EventModel {
  static async create(eventData: CreateEventDTO): Promise<Event> {
    const { user_id, title, start_time, end_time, status = EventStatus.BUSY } = eventData;
    
    const result = await pool.query(
      `INSERT INTO events (user_id, title, start_time, end_time, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, title, start_time, end_time, status]
    );
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<Event | null> {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Event[]> {
    const result = await pool.query(
      'SELECT * FROM events WHERE user_id = $1 ORDER BY start_time ASC',
      [userId]
    );
    
    return result.rows;
  }

  static async update(id: number, userId: number, updates: UpdateEventDTO): Promise<Event | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id, userId);
    
    const result = await pool.query(
      `UPDATE events SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
       RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async findSwappableSlots(excludeUserId: number): Promise<Event[]> {
    const result = await pool.query(
      `SELECT e.*, u.name as user_name, u.email as user_email 
       FROM events e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.status = $1 AND e.user_id != $2 
       ORDER BY e.start_time ASC`,
      [EventStatus.SWAPPABLE, excludeUserId]
    );
    
    return result.rows;
  }

  static async updateStatus(id: number, status: EventStatus): Promise<Event | null> {
    const result = await pool.query(
      'UPDATE events SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return result.rows[0] || null;
  }

  static async swapOwners(event1Id: number, event2Id: number): Promise<void> {
    await pool.query('BEGIN');
    
    try {
      // Get current owners
      const event1 = await this.findById(event1Id);
      const event2 = await this.findById(event2Id);
      
      if (!event1 || !event2) {
        throw new Error('Events not found');
      }
      
      // Swap owners and set status to BUSY
      await pool.query(
        'UPDATE events SET user_id = $1, status = $2 WHERE id = $3',
        [event2.user_id, EventStatus.BUSY, event1Id]
      );
      
      await pool.query(
        'UPDATE events SET user_id = $1, status = $2 WHERE id = $3',
        [event1.user_id, EventStatus.BUSY, event2Id]
      );
      
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}
