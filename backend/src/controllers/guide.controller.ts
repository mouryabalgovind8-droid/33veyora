import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Vendor: Get their guides
export const getGuides = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const guides = (await pool.query(
      'SELECT * FROM guides WHERE vendor_id = $1 ORDER BY name ASC',
      [vendorResult.rows[0].id]
    )).rows;

    res.json({ guides });
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vendor: Add guide
export const addGuide = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { name, email, phone, bio, specializations, languages, experienceYears, certification } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Guide name is required' });
    }

    const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const id = `guide-${uuidv4().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO guides (id, vendor_id, name, email, phone, bio, specializations, languages, experience_years, certification)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, vendorResult.rows[0].id, name, email || null, phone || null, bio || null, specializations || [], languages || [], experienceYears || 0, certification || []]
    );

    res.json({ message: 'Guide added', guideId: id });
  } catch (error) {
    console.error('Add guide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vendor: Update guide
export const updateGuide = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { name, email, phone, bio, specializations, languages, experienceYears, certification, isActive } = req.body;

    await pool.query(
      `UPDATE guides SET name=$1, email=$2, phone=$3, bio=$4, specializations=$5, languages=$6, experience_years=$7, certification=$8, is_active=$9 WHERE id=$10`,
      [name, email, phone, bio, specializations, languages, experienceYears, certification, isActive, id]
    );

    res.json({ message: 'Guide updated' });
  } catch (error) {
    console.error('Update guide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vendor: Delete guide
export const deleteGuide = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    await pool.query('DELETE FROM guides WHERE id = $1', [id]);
    res.json({ message: 'Guide deleted' });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Public: Get guides for a listing
export const getListingGuides = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { listingId } = req.params;

    const guides = (await pool.query(`
      SELECT g.id, g.name, g.bio, g.specializations, g.languages, g.experience_years, g.certification
      FROM guides g
      JOIN listings l ON l.vendor_id = g.vendor_id
      WHERE l.id = $1 AND g.is_active = true
    `, [listingId])).rows;

    res.json({ guides });
  } catch (error) {
    console.error('Get listing guides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
