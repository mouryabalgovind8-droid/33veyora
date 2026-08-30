import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper: resolve the vendor record id for the currently-authenticated user
async function resolveVendorId(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  const pool = getDatabase();
  const result = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
  return result.rows[0]?.id || null;
}

// GET /api/vendor/dashboard - Vendor overview stats
export const getVendorDashboard = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const vendorId = await resolveVendorId(userId);

    if (!vendorId) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Listings count
    const listingResult = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'approved')::int AS active
       FROM listings WHERE vendor_id = $1`,
      [vendorId]
    );

    // Bookings + earnings
    const bookingResult = await pool.query(
      `SELECT b.status, b.total_amount_inr, b.created_at
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       WHERE l.vendor_id = $1`,
      [vendorId]
    );

    // Average rating from listings
    const ratingResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::float AS avg
       FROM listings WHERE vendor_id = $1 AND rating > 0`,
      [vendorId]
    );

    const bookings = bookingResult.rows;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalEarnings = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (Number(b.total_amount_inr) || 0), 0);

    res.json({
      totalListings: listingResult.rows[0].total,
      activeListings: listingResult.rows[0].active,
      totalBookings,
      pendingBookings,
      totalEarnings,
      averageRating: Math.round(ratingResult.rows[0].avg * 10) / 10,
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/vendor/earnings - Revenue, payouts, monthly chart and recent transactions
export const getVendorEarnings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const vendorId = await resolveVendorId(userId);

    if (!vendorId) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Total earnings from confirmed/completed bookings (vendor share after platform commission)
    const revenueResult = await pool.query(
      `SELECT total_amount_inr FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       WHERE l.vendor_id = $1 AND b.status IN ('confirmed', 'completed')`,
      [vendorId]
    );
    const totalEarnings = revenueResult.rows.reduce(
      (sum, r) => sum + (Number(r.total_amount_inr) || 0), 0
    );

    // Payout summary
    const payoutResult = await pool.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'processing')), 0)::int AS pending,
         COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)::int AS completed
       FROM payouts WHERE vendor_id = $1`,
      [vendorId]
    );

    // Monthly earnings (last 6 months)
    const monthlyResult = await pool.query(
      `SELECT to_char(date_trunc('month', b.created_at), 'Mon') AS month,
              COALESCE(SUM(b.total_amount_inr), 0)::int AS amount
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       WHERE l.vendor_id = $1
         AND b.status IN ('confirmed', 'completed')
         AND b.created_at >= date_trunc('month', NOW()) - interval '5 months'
       GROUP BY date_trunc('month', b.created_at)
       ORDER BY date_trunc('month', b.created_at)`,
      [vendorId]
    );

    // Recent transactions
    const recentResult = await pool.query(
      `SELECT p.id, p.booking_id, p.amount, p.status, p.created_at AS date
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN listings l ON b.listing_id = l.id
       WHERE l.vendor_id = $1
       ORDER BY p.created_at DESC
       LIMIT 20`,
      [vendorId]
    );

    res.json({
      totalEarnings,
      pendingPayout: payoutResult.rows[0].pending,
      completedPayouts: payoutResult.rows[0].completed,
      monthlyEarnings: monthlyResult.rows.map(r => ({ month: r.month, amount: Number(r.amount) })),
      recentTransactions: recentResult.rows.map(r => ({
        id: r.id,
        bookingId: r.booking_id,
        amount: Number(r.amount),
        date: r.date,
        status: r.status,
      })),
    });
  } catch (error) {
    console.error('Vendor earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// GET /api/vendor/profile - Vendor business profile + verification status
export const getVendorProfile = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const result = await pool.query(
      `SELECT v.*, u.name, u.email, u.phone, u.avatar
       FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/vendor/profile - Update business profile / KYC contact info
export const updateVendorProfile = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const {
      businessName, businessType, description, address, city, state, country,
    } = req.body;

    const result = await pool.query(
      `UPDATE vendors SET
         business_name = COALESCE($1, business_name),
         business_type = COALESCE($2, business_type),
         description = COALESCE($3, description),
         address = COALESCE($4, address),
         city = COALESCE($5, city),
         state = COALESCE($6, state),
         country = COALESCE($7, country),
         updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [
        businessName ?? null, businessType ?? null, description ?? null,
        address ?? null, city ?? null, state ?? null, country ?? null, userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json({ message: 'Profile updated', profile: result.rows[0] });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};