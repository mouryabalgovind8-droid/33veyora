import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Get user's wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const result = await pool.query(`
      SELECT l.*, w.created_at as wishlisted_at,
             v.business_name as vendor_name
      FROM wishlist w
      JOIN listings l ON w.listing_id = l.id
      JOIN vendors v ON l.vendor_id = v.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [userId]);

    const listings = result.rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
    }));

    res.json({ listings });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listingResult = await pool.query('SELECT id FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const existingResult = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }

    const id = uuidv4();
    await pool.query(
      'INSERT INTO wishlist (id, user_id, listing_id) VALUES ($1, $2, $3)',
      [id, userId, listingId]
    );

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { listingId } = req.params;

    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
