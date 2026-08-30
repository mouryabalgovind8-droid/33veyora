import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Get all approved listings (with search, filter, pagination)
export const getListings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { search, category, maxPriceINR, city, page = '1', limit = '12' } = req.query;

    let query = `
      SELECT l.*, v.business_name as vendor_name 
      FROM listings l 
      JOIN vendors v ON l.vendor_id = v.id 
      WHERE l.status = 'approved'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex} OR l.location_city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category && category !== 'all') {
      query += ` AND l.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Price filter
    if (maxPriceINR) {
      query += ` AND l.price_inr <= $${paramIndex}`;
      params.push(Number(maxPriceINR));
      paramIndex++;
    }

    // City filter
    if (city) {
      query += ` AND l.location_city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Pagination — event listings are ordered by soonest start date
    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = category === 'event' ? 'l.event_start ASC NULLS LAST' : 'l.created_at DESC';
    query += ` ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    const listings = result.rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
    }));

    res.json({
      listings,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single listing
export const getListing = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;

    const result = await pool.query(`
      SELECT l.*, v.business_name as vendor_name, v.verification_status as vendor_verified,
             u.name as host_name, u.avatar as host_avatar
      FROM listings l 
      JOIN vendors v ON l.vendor_id = v.id 
      JOIN users u ON v.user_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing: any = result.rows[0];
    
    // Parse JSON fields (tolerate plain-text values from older/seeded rows)
    const safeParse = (val: any, fallback: any) => {
      if (val === null || val === undefined || val === '') return fallback;
      if (typeof val !== 'string') return val;
      try { return JSON.parse(val); } catch { return [val]; }
    };
    listing.images = safeParse(listing.images, []);
    listing.amenities = safeParse(listing.amenities, []);
    listing.rules = safeParse(listing.rules, []);

    // Get availability for next 30 days
    const availability = await pool.query(`
      SELECT date, total_slots, booked_slots 
      FROM availability 
      WHERE listing_id = $1 AND date >= CURRENT_DATE::text
      ORDER BY date LIMIT 30
    `, [id]);

    listing.availability = availability.rows.map(row => ({
      date: row.date,
      totalSlots: row.total_slots,
      bookedSlots: row.booked_slots,
      available: row.total_slots - row.booked_slots
    }));

    // Get reviews
    const reviews = await pool.query(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.listing_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    listing.reviews = reviews.rows.map(row => ({
      ...row,
      sub_ratings: row.sub_ratings ? JSON.parse(row.sub_ratings) : {}
    }));

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create listing (vendor only)
export const createListing = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    // Get vendor ID
    const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
    if (vendorResult.rows.length === 0) {
      return res.status(400).json({ error: 'Vendor profile not found' });
    }
    const vendorId = vendorResult.rows[0].id;

    const {
      title, tagline, description, category,
      locationAddress, locationCity, locationState, locationCountry,
      priceInr, priceUsd, priceUnit,
      maxGuests, images, amenities, rules,
      cancellationPolicy, minDays, maxDays,
      eventStart, eventEnd, prebookingEnabled, maxParticipants
    } = req.body;

    // Validation
    if (!title || !category || !priceInr) {
      return res.status(400).json({ error: 'Title, category, and price are required' });
    }
    if (!locationAddress) {
      return res.status(400).json({ error: 'Address is required for all listings' });
    }
    if (!locationCity) {
      return res.status(400).json({ error: 'City is required for all listings' });
    }
    if (!locationState) {
      return res.status(400).json({ error: 'State is required for all listings' });
    }
    
    // SECURITY: Validate pricing
    if (priceInr < 0 || (priceUsd && priceUsd < 0)) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }
    if (priceInr > 10000000) { // 1 crore limit
      return res.status(400).json({ error: 'Price exceeds maximum limit' });
    }
    
    // SECURITY: Validate title length (prevent abuse)
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be under 200 characters' });
    }
    if (description && description.length > 5000) {
      return res.status(400).json({ error: 'Description must be under 5000 characters' });
    }

    // EVENT VALIDATION: event listings require a valid schedule
    let eventStartIso: string | null = null;
    let eventEndIso: string | null = null;
    if (category === 'event') {
      if (!eventStart || !eventEnd) {
        return res.status(400).json({ error: 'Event start and end date/time are required for event listings' });
      }
      const start = new Date(eventStart);
      const end = new Date(eventEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid event date/time format' });
      }
      if (end <= start) {
        return res.status(400).json({ error: 'Event end must be after event start' });
      }
      eventStartIso = start.toISOString();
      eventEndIso = end.toISOString();
    }

    const listingId = uuidv4();
    await pool.query(`
      INSERT INTO listings (
        id, vendor_id, title, tagline, description, category,
        location_address, location_city, location_state, location_country,
        price_inr, price_usd, price_unit, max_guests,
        images, amenities, rules, cancellation_policy,
        min_days, max_days, status,
        event_start, event_end, prebooking_enabled, max_participants
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending', $21, $22, $23, $24)
    `, [
      listingId, vendorId, title, tagline || null, description || null, category,
      locationAddress || null, locationCity || null, locationState || null, locationCountry || 'India',
      priceInr, priceUsd || Math.round(priceInr / 83) || priceInr, priceUnit || 'night',
      maxGuests || 1,
      JSON.stringify(images || []), JSON.stringify(amenities || []),
      JSON.stringify(rules || []), cancellationPolicy || 'Full refund if cancelled 48 hours before check-in',
      minDays || 1, maxDays || null,
      eventStartIso, eventEndIso,
      prebookingEnabled === false ? false : true,
      maxParticipants ? Number(maxParticipants) : null
    ]);

    res.status(201).json({
      message: 'Listing created successfully. Pending admin approval.',
      listingId
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update listing (vendor only, own listings)
export const updateListing = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;

    // Verify ownership
    const vendorResult = await pool.query(
      'SELECT v.id FROM vendors v JOIN listings l ON v.id = l.vendor_id WHERE v.user_id = $1 AND l.id = $2',
      [userId, id]
    );
    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const {
      title, tagline, description, category,
      locationAddress, locationCity, locationState, locationCountry,
      priceInr, priceUsd, priceUnit,
      maxGuests, images, amenities, rules,
      cancellationPolicy, minDays, maxDays,
      eventStart, eventEnd, prebookingEnabled, maxParticipants
    } = req.body;

    await pool.query(`
      UPDATE listings SET
        title = COALESCE($1, title),
        tagline = COALESCE($2, tagline),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        location_address = COALESCE($5, location_address),
        location_city = COALESCE($6, location_city),
        location_state = COALESCE($7, location_state),
        location_country = COALESCE($8, location_country),
        price_inr = COALESCE($9, price_inr),
        price_usd = COALESCE($10, price_usd),
        price_unit = COALESCE($11, price_unit),
        max_guests = COALESCE($12, max_guests),
        images = COALESCE($13, images),
        amenities = COALESCE($14, amenities),
        rules = COALESCE($15, rules),
        cancellation_policy = COALESCE($16, cancellation_policy),
        min_days = COALESCE($17, min_days),
        max_days = COALESCE($18, max_days),
        event_start = COALESCE($19, event_start),
        event_end = COALESCE($20, event_end),
        prebooking_enabled = COALESCE($21, prebooking_enabled),
        max_participants = COALESCE($22, max_participants),
        updated_at = NOW()
      WHERE id = $23
    `, [
      title || null, tagline || null, description || null, category || null,
      locationAddress || null, locationCity || null, locationState || null, locationCountry || null,
      priceInr || null, priceUsd || null, priceUnit || null,
      maxGuests || null,
      images ? JSON.stringify(images) : null,
      amenities ? JSON.stringify(amenities) : null,
      rules ? JSON.stringify(rules) : null,
      cancellationPolicy || null,
      minDays || null, maxDays || null,
      eventStart ? new Date(eventStart).toISOString() : null,
      eventEnd ? new Date(eventEnd).toISOString() : null,
      typeof prebookingEnabled === 'boolean' ? prebookingEnabled : null,
      maxParticipants ? Number(maxParticipants) : null,
      id
    ]);

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete listing (vendor only, own listings)
export const deleteListing = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;

    // Verify ownership
    const vendorResult = await pool.query(
      'SELECT v.id FROM vendors v JOIN listings l ON v.id = l.vendor_id WHERE v.user_id = $1 AND l.id = $2',
      [userId, id]
    );
    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get vendor's own listings
export const getVendorListings = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const userId = (req as AuthRequest).userId;

    const result = await pool.query(`
      SELECT l.* FROM listings l
      JOIN vendors v ON l.vendor_id = v.id
      WHERE v.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);

    const listings = result.rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
    }));

    res.json({ listings });
  } catch (error) {
    console.error('Get vendor listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
