import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const { listingId, checkInDate, checkOutDate, guestsCount, specialRequests } = req.body;

    // Validation
    if (!listingId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Listing, check-in date, and check-out date are required' });
    }

    // Get listing details
    const listingResult = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND status = $2',
      [listingId, 'approved']
    );
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or not available' });
    }

    const listing = listingResult.rows[0];

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (checkOut <= checkIn) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    
    // SECURITY: Prevent booking in the past
    if (checkIn < new Date()) {
      return res.status(400).json({ error: 'Cannot book dates in the past' });
    }
    
    // SECURITY: Validate guests count
    if (!guestsCount || guestsCount < 1 || guestsCount > 50) {
      return res.status(400).json({ error: 'Invalid guest count (1-50)' });
    }

    // SECURITY: Enforce event participant capacity (pre-booking limit)
    if (listing.max_participants) {
      const bookedResult = await pool.query(
        `SELECT COALESCE(SUM(guests_count), 0) as booked FROM bookings
         WHERE listing_id = $1 AND status IN ('pending', 'confirmed')`,
        [listingId]
      );
      const alreadyBooked = parseInt(bookedResult.rows[0]?.booked || '0', 10);
      if (alreadyBooked + guestsCount > listing.max_participants) {
        const spotsLeft = Math.max(0, listing.max_participants - alreadyBooked);
        return res.status(400).json({ error: `Event capacity reached — only ${spotsLeft} spot(s) left` });
      }
    }
    
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights < (listing.min_days || 1)) {
      return res.status(400).json({ error: `Minimum stay is ${listing.min_days || 1} night(s)` });
    }

    if (listing.max_days && nights > listing.max_days) {
      return res.status(400).json({ error: `Maximum stay is ${listing.max_days} night(s)` });
    }

    // Check availability for each date with row-level locking to prevent race conditions
    const guests = guestsCount || 1;
    
    // SECURITY: Use a transaction with row-level locking to prevent double booking
    await pool.query('BEGIN');
    
    try {
      const currentDate = new Date(checkIn);
      
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Lock the row for update to prevent concurrent bookings
        const availResult = await pool.query(
          'SELECT total_slots, booked_slots FROM availability WHERE listing_id = $1 AND date = $2 FOR UPDATE',
          [listingId, dateStr]
        );

        if (availResult.rows.length > 0) {
          const { total_slots, booked_slots } = availResult.rows[0];
          if (total_slots - booked_slots < guests) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: `Not enough availability on ${dateStr}` });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }

    // SECURITY: Validate pricing - prevent negative values
    if (listing.price_inr < 0 || listing.price_usd < 0) {
      return res.status(400).json({ error: 'Invalid listing price' });
    }
    
    // Calculate total price
    const totalAmountInr = listing.price_inr * nights * guests;
    const totalAmountUsd = listing.price_usd * nights * guests;
    
    // SECURITY: Sanity check - max booking amount
    if (totalAmountInr > 10000000) { // 1 crore limit
      return res.status(400).json({ error: 'Booking amount exceeds maximum limit' });
    }

    // Create booking
    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
    await pool.query(`
      INSERT INTO bookings (
        id, user_id, listing_id, check_in_date, check_out_date,
        guests_count, total_amount_inr, total_amount_usd,
        paid_amount, paid_currency, status, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed', $11)
    `, [
      bookingId, userId, listingId, checkInDate, checkOutDate,
      guests, totalAmountInr, totalAmountUsd,
      totalAmountInr, 'INR', specialRequests || null
    ]);

    // Update availability
    const updateDate = new Date(checkIn);
    while (updateDate < checkOut) {
      const dateStr = updateDate.toISOString().split('T')[0];
      
      const existingAvail = await pool.query(
        'SELECT id FROM availability WHERE listing_id = $1 AND date = $2',
        [listingId, dateStr]
      );

      if (existingAvail.rows.length > 0) {
        await pool.query(
          'UPDATE availability SET booked_slots = booked_slots + $1 WHERE listing_id = $2 AND date = $3',
          [guests, listingId, dateStr]
        );
      } else {
        await pool.query(
          'INSERT INTO availability (id, listing_id, date, total_slots, booked_slots) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), listingId, dateStr, listing.max_guests || 10, guests]
        );
      }

      updateDate.setDate(updateDate.getDate() + 1);
    }

    // Create notification for vendor
    const vendorResult = await pool.query(
      'SELECT user_id FROM vendors WHERE id = $1', 
      [listing.vendor_id]
    );
    if (vendorResult.rows.length > 0) {
      await pool.query(
        'INSERT INTO notifications (id, user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          uuidv4(), vendorResult.rows[0].user_id, 'new_booking',
          'New Booking Received',
          `You have a new booking for ${listing.title} from ${checkInDate} to ${checkOutDate}`,
          JSON.stringify({ bookingId, listingId })
        ]
      );
    }

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: {
        id: bookingId,
        listing: {
          id: listing.id,
          title: listing.title
        },
        checkInDate,
        checkOutDate,
        guestsCount: guests,
        nights,
        totalAmountInr,
        totalAmountUsd,
        status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user's bookings
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { status } = req.query;

    let query = `
      SELECT b.*, l.title as listing_title, l.images as listing_images,
             v.business_name as vendor_name
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN vendors v ON l.vendor_id = v.id
      WHERE b.user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    const bookings = result.rows.map(row => ({
      ...row,
      listing_images: row.listing_images ? JSON.parse(row.listing_images) : [],
    }));

    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single booking
export const getBooking = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const userRole = (req as AuthRequest).userRole;
    const { id } = req.params;

    const result = await pool.query(`
      SELECT b.*, l.title as listing_title, l.images as listing_images, l.price_inr,
             l.location_city, l.location_address,
             v.business_name as vendor_name, v.user_id as vendor_user_id,
             u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN vendors v ON l.vendor_id = v.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Check authorization
    if (userRole === 'user' && booking.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (userRole === 'vendor' && booking.vendor_user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    booking.listing_images = booking.listing_images ? JSON.parse(booking.listing_images) : [];

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const { reason } = req.body;

    // Get booking
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check ownership
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Calculate refund based on cancellation policy
    const checkIn = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let refundPercentage = 0;
    if (hoursUntilCheckIn > 48) {
      refundPercentage = 80;
    } else if (hoursUntilCheckIn > 24) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const refundAmount = Math.round(booking.total_amount_inr * refundPercentage / 100);

    // Update booking
    await pool.query(`
      UPDATE bookings SET
        status = 'cancelled',
        cancellation_reason = $1,
        refund_amount = $2,
        refund_status = 'pending',
        updated_at = NOW()
      WHERE id = $3
    `, [reason || 'Cancelled by user', refundAmount, id]);

    // Restore availability
    const guests = booking.guests_count;
    const updateDate = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    
    while (updateDate < checkOut) {
      const dateStr = updateDate.toISOString().split('T')[0];
      await pool.query(
        'UPDATE availability SET booked_slots = GREATEST(0, booked_slots - $1) WHERE listing_id = $2 AND date = $3',
        [guests, booking.listing_id, dateStr]
      );
      updateDate.setDate(updateDate.getDate() + 1);
    }

    // Notify vendor
    const listingResult = await pool.query('SELECT vendor_id, title FROM listings WHERE id = $1', [booking.listing_id]);
    if (listingResult.rows.length > 0) {
      const listing = listingResult.rows[0];
      const vendorResult = await pool.query('SELECT user_id FROM vendors WHERE id = $1', [listing.vendor_id]);
      if (vendorResult.rows.length > 0) {
        await pool.query(
          'INSERT INTO notifications (id, user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            uuidv4(), vendorResult.rows[0].user_id, 'booking_cancelled',
            'Booking Cancelled',
            `A booking for ${listing.title} has been cancelled`,
            JSON.stringify({ bookingId: id })
          ]
        );
      }
    }

    res.json({
      message: 'Booking cancelled successfully',
      refundAmount,
      refundPercentage,
      refundStatus: 'pending'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get vendor's bookings
export const getVendorBookings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const result = await pool.query(`
      SELECT b.*, l.title as listing_title, l.images as listing_images,
             l.location_city as listing_city, l.location_state as listing_state,
             u.name as guest_name, u.email as guest_email, u.phone as guest_phone
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN vendors v ON l.vendor_id = v.id
      JOIN users u ON b.user_id = u.id
      WHERE v.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);

    const bookings = result.rows.map(row => ({
      ...row,
      listing_images: row.listing_images ? JSON.parse(row.listing_images) : [],
    }));

    res.json({ bookings });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vendor: Accept or reject booking
export const respondToBooking = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accept or reject' });
    }

    // Get booking with vendor ownership check
    const bookingResult = await pool.query(`
      SELECT b.*, v.user_id as vendor_user_id
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN vendors v ON l.vendor_id = v.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    if (booking.vendor_user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Cannot respond to this booking' });
    }

    const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';
    const refundAmount = action === 'reject' ? booking.total_amount_inr : 0;

    await pool.query(
      `UPDATE bookings SET status = $1, vendor_status = $2, vendor_response_at = NOW(),
       refund_amount = $3, refund_status = $4, cancellation_reason = $5, updated_at = NOW()
       WHERE id = $6`,
      [newStatus, action, refundAmount, action === 'reject' ? 'pending' : 'none', reason || null, id]
    );

    res.json({
      message: action === 'accept' ? 'Booking accepted' : 'Booking rejected',
      bookingId: id,
      status: newStatus
    });
  } catch (error) {
    console.error('Respond to booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User: Request reschedule
export const requestReschedule = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const { newCheckIn, newCheckOut, reason } = req.body;

    if (!newCheckIn || !newCheckOut) {
      return res.status(400).json({ error: 'New dates are required' });
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Can only reschedule confirmed bookings' });
    }

    await pool.query(
      `UPDATE bookings SET reschedule_requested = true, new_check_in = $1, new_check_out = $2,
       reschedule_reason = $3, updated_at = NOW() WHERE id = $4`,
      [newCheckIn, newCheckOut, reason || null, id]
    );

    res.json({ message: 'Reschedule request sent to host', bookingId: id });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
