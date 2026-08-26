-- ============================================
-- MIGRATION 002: Add BRD Missing Features
-- ============================================

-- 1. Room/property types
ALTER TABLE listings ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'standard';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS room_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_rooms INTEGER DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bed_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bathroom_type TEXT;

-- 2. Check-in/check-out policies
ALTER TABLE listings ADD COLUMN IF NOT EXISTS check_in_time TEXT DEFAULT '14:00';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS check_out_time TEXT DEFAULT '11:00';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS early_check_in BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS late_check_out BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS self_check_in BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS check_in_instructions TEXT;

-- 3. Experience/Event enhancements
ALTER TABLE listings ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(4,1);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS experience_subcategory TEXT;

-- 4. Age/difficulty/fitness/safety
ALTER TABLE listings ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'easy';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_age INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS fitness_level TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS safety_info TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS what_to_bring TEXT;

-- 5. Equipment & Guides
ALTER TABLE listings ADD COLUMN IF NOT EXISTS equipment_provided TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS equipment_required TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS guide_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS guide_bio TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS guide_experience TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];

-- 6. Weather cancellation
ALTER TABLE listings ADD COLUMN IF NOT EXISTS weather_cancellation_policy TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS weather_refund_percentage INTEGER DEFAULT 100;

-- 7. Safety certificates
ALTER TABLE listings ADD COLUMN IF NOT EXISTS safety_certificates TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS insurance_info TEXT;

-- 8. Capacity management
ALTER TABLE listings ADD COLUMN IF NOT EXISTS current_booked_slots INTEGER DEFAULT 0;

-- ============================================
-- BOOKINGS: Accept/reject & reschedule
-- ============================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'auto_confirmed';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_response_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_requested BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS new_check_in DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS new_check_out DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;

-- ============================================
-- DISPUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  raised_by TEXT NOT NULL,
  raised_against TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  admin_notes TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOCATIONS TABLE (admin managed)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  is_popular BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GUIDES/INSTRUCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  vendor_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  specializations TEXT[],
  languages TEXT[],
  experience_years INTEGER DEFAULT 0,
  certification TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROMOTIONAL CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC(10,2),
  min_booking_amount NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  category TEXT,
  listing_id TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMISSION REPORTS VIEW
-- ============================================
CREATE OR REPLACE VIEW commission_report AS
SELECT
  l.category,
  COUNT(b.id) as total_bookings,
  SUM(b.total_amount_inr) as total_revenue,
  SUM(b.total_amount_inr * COALESCE(c.percentage, 10) / 100) as total_commission,
  COALESCE(c.percentage, 10) as commission_rate
FROM bookings b
JOIN listings l ON b.listing_id = l.id
LEFT JOIN commissions c ON c.category = l.category
WHERE b.status IN ('confirmed', 'completed')
GROUP BY l.category, c.percentage;
