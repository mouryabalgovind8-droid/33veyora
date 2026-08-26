import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Admin: Create campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { name, code, description, discountType, discountValue, minBookingAmount, maxDiscount, category, listingId, startDate, endDate, maxUses } = req.body;

    if (!name || !code || !discountValue) {
      return res.status(400).json({ error: 'Name, code, and discount value are required' });
    }

    // Check if code already exists
    const existing = await pool.query('SELECT id FROM campaigns WHERE code = $1', [code.toUpperCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Campaign code already exists' });
    }

    const id = `CMP-${uuidv4().slice(0, 8).toUpperCase()}`;
    await pool.query(
      `INSERT INTO campaigns (id, name, code, description, discount_type, discount_value, min_booking_amount, max_discount, category, listing_id, start_date, end_date, max_uses)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, name, code.toUpperCase(), description || null, discountType || 'percentage', discountValue, minBookingAmount || 0, maxDiscount || null, category || null, listingId || null, startDate || null, endDate || null, maxUses || null]
    );

    res.json({ message: 'Campaign created', campaignId: id });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get all campaigns
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const campaigns = (await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC')).rows;
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Update campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { name, description, discountType, discountValue, minBookingAmount, maxDiscount, isActive, startDate, endDate, maxUses } = req.body;

    await pool.query(
      `UPDATE campaigns SET name=$1, description=$2, discount_type=$3, discount_value=$4, min_booking_amount=$5, max_discount=$6, is_active=$7, start_date=$8, end_date=$9, max_uses=$10 WHERE id=$11`,
      [name, description, discountType, discountValue, minBookingAmount, maxDiscount, isActive, startDate, endDate, maxUses, id]
    );

    res.json({ message: 'Campaign updated' });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Delete campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User: Validate & apply promo code
export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const { code, bookingAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const result = await pool.query('SELECT * FROM campaigns WHERE code = $1 AND is_active = true', [code.toUpperCase()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or inactive promo code' });
    }

    const campaign = result.rows[0];

    // Check expiry
    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    // Check usage limit
    if (campaign.max_uses && campaign.current_uses >= campaign.max_uses) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    // Check min amount
    if (bookingAmount < campaign.min_booking_amount) {
      return res.status(400).json({ error: `Minimum booking amount is ₹${campaign.min_booking_amount}` });
    }

    // Calculate discount
    let discount = 0;
    if (campaign.discount_type === 'percentage') {
      discount = (bookingAmount * campaign.discount_value) / 100;
      if (campaign.max_discount) {
        discount = Math.min(discount, campaign.max_discount);
      }
    } else {
      discount = campaign.discount_value;
    }

    discount = Math.min(discount, bookingAmount);

    res.json({
      valid: true,
      campaignId: campaign.id,
      discount: Math.round(discount),
      discountType: campaign.discount_type,
      discountValue: campaign.discount_value,
      finalAmount: Math.round(bookingAmount - discount),
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
