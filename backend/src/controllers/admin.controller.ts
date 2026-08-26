import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Get dashboard stats
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();

    const [usersCount, vendorsCount, listingsCount, bookingsCount, pendingVendors, pendingListings, totalRevenue, pendingRefunds] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'"),
      pool.query('SELECT COUNT(*) as count FROM vendors'),
      pool.query('SELECT COUNT(*) as count FROM listings'),
      pool.query('SELECT COUNT(*) as count FROM bookings'),
      pool.query("SELECT COUNT(*) as count FROM vendors WHERE verification_status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM listings WHERE status = 'pending'"),
      pool.query("SELECT COALESCE(SUM(paid_amount), 0) as total FROM bookings WHERE status IN ('confirmed', 'completed')"),
      pool.query("SELECT COUNT(*) as count FROM bookings WHERE refund_status = 'pending'"),
    ]);

    const recentBookings = (await pool.query(`
      SELECT b.*, l.title as listing_title, u.name as guest_name
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `)).rows;

    res.json({
      stats: {
        users: parseInt(usersCount.rows[0].count),
        vendors: parseInt(vendorsCount.rows[0].count),
        listings: parseInt(listingsCount.rows[0].count),
        bookings: parseInt(bookingsCount.rows[0].count),
        pendingVendors: parseInt(pendingVendors.rows[0].count),
        pendingListings: parseInt(pendingListings.rows[0].count),
        totalRevenue: parseInt(totalRevenue.rows[0].total),
        pendingRefunds: parseInt(pendingRefunds.rows[0].count),
      },
      recentBookings
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { role, search, page = '1', limit = '20' } = req.query;

    let query = 'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as sub`, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const users = (await pool.query(query, params)).rows;

    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle user status (activate/deactivate)
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;

    const userResult = await pool.query('SELECT is_active FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentStatus = userResult.rows[0].is_active;
    const newStatus = currentStatus ? 0 : 1;

    await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, id]);

    res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all vendors
export const getVendors = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { status, search, page = '1', limit = '20' } = req.query;

    let query = `
      SELECT v.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND v.verification_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (v.business_name ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as sub`, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY v.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const vendors = (await pool.query(query, params)).rows;

    res.json({ vendors, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve vendor
export const approveVendor = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;

    const vendorResult = await pool.query('SELECT id, user_id, business_name FROM vendors WHERE id = $1', [id]);
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = vendorResult.rows[0];
    await pool.query("UPDATE vendors SET verification_status = 'verified' WHERE id = $1", [id]);

    await pool.query(
      'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), vendor.user_id, 'vendor_approved', 'Vendor Approved', `Your business "${vendor.business_name}" has been verified and approved!`]
    );

    res.json({ message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject vendor
export const rejectVendor = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { reason } = req.body;

    const vendorResult = await pool.query('SELECT id, user_id, business_name FROM vendors WHERE id = $1', [id]);
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = vendorResult.rows[0];
    await pool.query("UPDATE vendors SET verification_status = 'rejected', rejection_reason = $1 WHERE id = $2", [reason || 'Not approved', id]);

    await pool.query(
      'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), vendor.user_id, 'vendor_rejected', 'Vendor Application Rejected', `Your business "${vendor.business_name}" application was not approved. Reason: ${reason || 'Not approved'}`]
    );

    res.json({ message: 'Vendor rejected' });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all listings (admin view)
export const getListings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { status, search, page = '1', limit = '20' } = req.query;

    let query = `
      SELECT l.*, v.business_name as vendor_name, u.name as vendor_owner
      FROM listings l
      JOIN vendors v ON l.vendor_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (l.title ILIKE $${paramIndex} OR l.location_city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as sub`, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const listings = (await pool.query(query, params)).rows;

    res.json({ listings, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Get admin listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve listing
export const approveListing = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;

    const listingResult = await pool.query('SELECT id, title, vendor_id FROM listings WHERE id = $1', [id]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];
    await pool.query("UPDATE listings SET status = 'approved' WHERE id = $1", [id]);

    const vendorResult = await pool.query('SELECT user_id FROM vendors WHERE id = $1', [listing.vendor_id]);
    if (vendorResult.rows.length > 0) {
      await pool.query(
        'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), vendorResult.rows[0].user_id, 'listing_approved', 'Listing Approved', `Your listing "${listing.title}" has been approved and is now live!`]
      );
    }

    res.json({ message: 'Listing approved successfully' });
  } catch (error) {
    console.error('Approve listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject listing
export const rejectListing = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { reason } = req.body;

    const listingResult = await pool.query('SELECT id, title, vendor_id FROM listings WHERE id = $1', [id]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];
    await pool.query("UPDATE listings SET status = 'rejected', rejection_reason = $1 WHERE id = $2", [reason || 'Not approved', id]);

    const vendorResult = await pool.query('SELECT user_id FROM vendors WHERE id = $1', [listing.vendor_id]);
    if (vendorResult.rows.length > 0) {
      await pool.query(
        'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), vendorResult.rows[0].user_id, 'listing_rejected', 'Listing Rejected', `Your listing "${listing.title}" was not approved. Reason: ${reason || 'Not approved'}`]
      );
    }

    res.json({ message: 'Listing rejected' });
  } catch (error) {
    console.error('Reject listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all bookings (admin view)
export const getBookings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { status, page = '1', limit = '20' } = req.query;

    let query = `
      SELECT b.*, l.title as listing_title, u.name as guest_name,
             v.business_name as vendor_name
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN users u ON b.user_id = u.id
      JOIN vendors v ON l.vendor_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as sub`, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const bookings = (await pool.query(query, params)).rows;

    res.json({ bookings, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pending refunds
export const getRefunds = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();

    const refunds = (await pool.query(`
      SELECT b.*, l.title as listing_title, u.name as guest_name,
             v.business_name as vendor_name
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN users u ON b.user_id = u.id
      JOIN vendors v ON l.vendor_id = v.id
      WHERE b.refund_status = 'pending'
      ORDER BY b.updated_at DESC
    `)).rows;

    res.json({ refunds });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process refund
export const processRefund = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { action } = req.body;

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.refund_status !== 'pending') {
      return res.status(400).json({ error: 'No pending refund for this booking' });
    }

    if (action === 'approve') {
      await pool.query("UPDATE bookings SET refund_status = 'approved', status = 'refunded' WHERE id = $1", [id]);
      await pool.query(
        'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), booking.user_id, 'refund_approved', 'Refund Approved', `Your refund of ₹${booking.refund_amount} has been approved and will be processed shortly.`]
      );
    } else if (action === 'reject') {
      await pool.query("UPDATE bookings SET refund_status = 'rejected' WHERE id = $1", [id]);
      await pool.query(
        'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), booking.user_id, 'refund_rejected', 'Refund Rejected', `Your refund request for booking ${id} has been rejected.`]
      );
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    res.json({ message: `Refund ${action}d successfully` });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get stats for analytics
export const getStats = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();

    const monthlyRevenue = (await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, 
             SUM(paid_amount) as revenue,
             COUNT(*) as bookings
      FROM bookings 
      WHERE status IN ('confirmed', 'completed')
      AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `)).rows;

    const categoryStats = (await pool.query(`
      SELECT l.category, COUNT(*) as count, SUM(b.paid_amount) as revenue
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY l.category
    `)).rows;

    const topListings = (await pool.query(`
      SELECT l.title, COUNT(b.id) as booking_count, SUM(b.paid_amount) as revenue
      FROM listings l
      JOIN bookings b ON l.id = b.listing_id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY l.id
      ORDER BY revenue DESC
      LIMIT 10
    `)).rows;

    res.json({ monthlyRevenue, categoryStats, topListings });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
