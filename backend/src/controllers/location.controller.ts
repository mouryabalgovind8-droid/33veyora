import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

// Get all locations
export const getLocations = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { popular } = req.query;

    let query = 'SELECT * FROM locations';
    const params: any[] = [];

    if (popular === 'true') {
      query += ' WHERE is_popular = true';
    }

    query += ' ORDER BY name ASC';
    const locations = (await pool.query(query, params)).rows;

    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Create location
export const createLocation = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { name, city, state, country, latitude, longitude, isPopular, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    const id = `loc-${uuidv4().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO locations (id, name, city, state, country, latitude, longitude, is_popular, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, name, city || null, state || null, country || 'India', latitude || null, longitude || null, isPopular || false, imageUrl || null]
    );

    res.json({ message: 'Location created', locationId: id });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Update location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { name, city, state, country, latitude, longitude, isPopular, imageUrl } = req.body;

    await pool.query(
      `UPDATE locations SET name=$1, city=$2, state=$3, country=$4, latitude=$5, longitude=$6, is_popular=$7, image_url=$8 WHERE id=$9`,
      [name, city, state, country, latitude, longitude, isPopular, imageUrl, id]
    );

    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Delete location
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    await pool.query('DELETE FROM locations WHERE id = $1', [id]);
    res.json({ message: 'Location deleted' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
