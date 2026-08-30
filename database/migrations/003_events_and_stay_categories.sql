-- ============================================
-- MIGRATION 003: Events & expanded stay categories
-- - Aligns listing categories with BRD section 1.1 (Hotels, Resorts,
--   Villas, Apartments, Homestays, Guest houses, Cottages, Hostels,
--   Private rooms, Camps, Luxury stays + Experiences)
-- - Adds event scheduling (event_start / event_end) and pre-booking flag
-- Idempotent: safe to run on every server start.
-- ============================================

-- 1. Expand listing categories to match the BRD
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_check;
ALTER TABLE listings ADD CONSTRAINT listings_category_check CHECK (category IN (
  'homestay', 'hotel', 'resort', 'villa', 'apartment', 'guesthouse',
  'cottage', 'hostel', 'private_room', 'camp', 'luxury',
  'adventure', 'workshop', 'event'
));

-- 2. Event scheduling columns (host must specify when event starts & ends)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS event_start TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS event_end TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS prebooking_enabled BOOLEAN DEFAULT true;

-- 3. Index for upcoming-event ordering on home/search
CREATE INDEX IF NOT EXISTS idx_listings_event_start ON listings(event_start);