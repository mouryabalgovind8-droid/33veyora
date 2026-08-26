import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// User: Raise dispute
export const raiseDispute = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { bookingId, reason, description } = req.body;

    if (!bookingId || !reason) {
      return res.status(400).json({ error: 'Booking ID and reason are required' });
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const id = `DIS-${uuidv4().slice(0, 8).toUpperCase()}`;
    await pool.query(
      `INSERT INTO disputes (id, booking_id, raised_by, reason, description) VALUES ($1, $2, $3, $4, $5)`,
      [id, bookingId, userId, reason, description || null]
    );

    res.json({ message: 'Dispute raised successfully', disputeId: id });
  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get all disputes
export const getDisputes = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { status } = req.query;

    let query = `
      SELECT d.*, b.total_amount_inr, b.check_in_date, b.check_out_date,
             u.name as raised_by_name, l.title as listing_title
      FROM disputes d
      JOIN bookings b ON d.booking_id = b.id
      JOIN users u ON d.raised_by = u.id
      JOIN listings l ON b.listing_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY d.created_at DESC';
    const disputes = (await pool.query(query, params)).rows;

    res.json({ disputes });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Resolve dispute
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { status, resolution, adminNotes, refundAmount } = req.body;

    if (!status || !resolution) {
      return res.status(400).json({ error: 'Status and resolution are required' });
    }

    await pool.query(
      `UPDATE disputes SET status = $1, resolution = $2, admin_notes = $3, resolved_at = NOW(), updated_at = NOW() WHERE id = $4`,
      [status, resolution, adminNotes || null, id]
    );

    // If refund approved, update booking
    if (status === 'resolved' && refundAmount) {
      await pool.query(
        `UPDATE bookings SET refund_amount = $1, refund_status = 'approved' WHERE id = (SELECT booking_id FROM disputes WHERE id = $2)`,
        [refundAmount, id]
      );
    }

    res.json({ message: 'Dispute resolved', disputeId: id });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
