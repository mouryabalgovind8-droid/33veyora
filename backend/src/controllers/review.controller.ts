import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Create review
export const createReview = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const { listingId, bookingId, rating, comment, subRatings } = req.body;

    if (!listingId || !rating) {
      return res.status(400).json({ error: 'Listing and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (bookingId) {
      const bookingResult = await pool.query(
        'SELECT id FROM bookings WHERE id = $1 AND user_id = $2 AND listing_id = $3 AND status = $4',
        [bookingId, userId, listingId, 'completed']
      );
      if (bookingResult.rows.length === 0) {
        return res.status(400).json({ error: 'You can only review listings you have completed' });
      }
    }

    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this listing' });
    }

    const reviewId = uuidv4();
    await pool.query(
      'INSERT INTO reviews (id, user_id, listing_id, booking_id, rating, comment, sub_ratings) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [reviewId, userId, listingId, bookingId || null, rating, comment || null, JSON.stringify(subRatings || {})]
    );

    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE listing_id = $1',
      [listingId]
    );
    if (avgResult.rows.length > 0) {
      const { avg_rating, count } = avgResult.rows[0];
      await pool.query(
        'UPDATE listings SET rating = $1, review_count = $2 WHERE id = $3',
        [Math.round(parseFloat(avg_rating) * 10) / 10, parseInt(count), listingId]
      );
    }

    res.status(201).json({ message: 'Review submitted successfully', reviewId });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get reviews for a listing
export const getListingReviews = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { listingId } = req.params;

    const result = await pool.query(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.listing_id = $1
      ORDER BY r.created_at DESC
    `, [listingId]);

    const reviews = result.rows.map(row => ({
      ...row,
      sub_ratings: row.sub_ratings ? JSON.parse(row.sub_ratings) : {}
    }));

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vendor responds to review
export const respondToReview = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const reviewResult = await pool.query(`
      SELECT r.id FROM reviews r
      JOIN listings l ON r.listing_id = l.id
      JOIN vendors v ON l.vendor_id = v.id
      WHERE r.id = $1 AND v.user_id = $2
    `, [id, userId]);

    if (reviewResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('UPDATE reviews SET host_response = $1 WHERE id = $2', [response, id]);

    res.json({ message: 'Response added successfully' });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
