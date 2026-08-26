import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';

// Revenue report
export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { period } = req.query; // 'daily', 'weekly', 'monthly'

    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case 'daily':
        groupBy = "DATE(b.created_at)";
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        groupBy = "DATE_TRUNC('week', b.created_at)";
        dateFormat = 'YYYY-WW';
        break;
      default:
        groupBy = "TO_CHAR(b.created_at, 'YYYY-MM')";
        dateFormat = 'YYYY-MM';
    }

    const revenueByPeriod = (await pool.query(`
      SELECT ${groupBy} as period,
             COUNT(b.id) as bookings,
             SUM(b.total_amount_inr) as revenue,
             SUM(b.total_amount_inr * COALESCE(c.percentage, 10) / 100) as commission
      FROM bookings b
      LEFT JOIN listings l ON b.listing_id = l.id
      LEFT JOIN commissions c ON c.category = l.category
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 12
    `)).rows;

    const revenueByCategory = (await pool.query(`
      SELECT l.category,
             COUNT(b.id) as bookings,
             SUM(b.total_amount_inr) as revenue,
             COALESCE(c.percentage, 10) as commission_rate
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      LEFT JOIN commissions c ON c.category = l.category
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY l.category, c.percentage
      ORDER BY revenue DESC
    `)).rows;

    const revenueByCity = (await pool.query(`
      SELECT l.location_city as city,
             COUNT(b.id) as bookings,
             SUM(b.total_amount_inr) as revenue
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY l.location_city
      ORDER BY revenue DESC
      LIMIT 10
    `)).rows;

    res.json({ revenueByPeriod, revenueByCategory, revenueByCity });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Booking report
export const getBookingReport = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();

    const statusBreakdown = (await pool.query(`
      SELECT status, COUNT(*) as count FROM bookings GROUP BY status
    `)).rows;

    const cancelRate = (await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        ROUND(COUNT(*) FILTER (WHERE status = 'cancelled') * 100.0 / NULLIF(COUNT(*), 0), 1) as cancel_rate
      FROM bookings
    `)).rows[0];

    const topListings = (await pool.query(`
      SELECT l.id, l.title, l.category, l.location_city,
             COUNT(b.id) as booking_count,
             SUM(b.total_amount_inr) as total_revenue
      FROM listings l
      JOIN bookings b ON b.listing_id = l.id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY l.id, l.title, l.category, l.location_city
      ORDER BY booking_count DESC
      LIMIT 10
    `)).rows;

    res.json({ statusBreakdown, cancelRate, topListings });
  } catch (error) {
    console.error('Booking report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User activity report
export const getUserReport = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();

    const usersByRole = (await pool.query(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `)).rows;

    const recentRegistrations = (await pool.query(`
      SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `)).rows;

    const topGuests = (await pool.query(`
      SELECT u.id, u.name, u.email,
             COUNT(b.id) as total_bookings,
             SUM(b.total_amount_inr) as total_spent
      FROM users u
      JOIN bookings b ON b.user_id = u.id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY u.id, u.name, u.email
      ORDER BY total_spent DESC
      LIMIT 10
    `)).rows;

    res.json({ usersByRole, recentRegistrations, topGuests });
  } catch (error) {
    console.error('User report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export report (CSV-like JSON)
export const exportReport = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { type } = req.query;

    if (type === 'bookings') {
      const data = (await pool.query(`
        SELECT b.id, b.status, b.total_amount_inr, b.created_at,
               l.title as listing, l.category,
               u.name as guest, u.email as guest_email
        FROM bookings b
        JOIN listings l ON b.listing_id = l.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
      `)).rows;
      res.json({ data, count: data.length });
    } else if (type === 'vendors') {
      const data = (await pool.query(`
        SELECT v.*, u.name, u.email,
               COUNT(l.id) as listing_count,
               COUNT(b.id) as booking_count,
               SUM(b.total_amount_inr) as total_revenue
        FROM vendors v
        JOIN users u ON v.user_id = u.id
        LEFT JOIN listings l ON l.vendor_id = v.id
        LEFT JOIN bookings b ON b.listing_id = l.id AND b.status IN ('confirmed','completed')
        GROUP BY v.id, u.name, u.email
        ORDER BY total_revenue DESC
      `)).rows;
      res.json({ data, count: data.length });
    } else {
      res.status(400).json({ error: 'Type must be bookings or vendors' });
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
