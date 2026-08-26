-- 33veyora Seed Data (PostgreSQL)
-- Version: 001

-- ============================================
-- DEFAULT ADMINS
-- ============================================
INSERT INTO users (id, name, email, password, phone, role, is_active)
VALUES 
    ('admin-001', 'Admin User', 'admin@havenhorizon.com', '$2a$10$YourHashedPasswordHere', '+91 99999 00000', 'admin', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE VENDORS
-- ============================================
INSERT INTO users (id, name, email, password, phone, role, is_active)
VALUES 
    ('vendor-001', 'Aarav Sharma', 'aarav@havenhorizon.com', '$2a$10$YourHashedPasswordHere', '+91 98765 43210', 'vendor', 1),
    ('vendor-002', 'Captain Vikram Singh', 'vikram@havenhorizon.com', '$2a$10$YourHashedPasswordHere', '+91 98765 43211', 'vendor', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, user_id, business_name, business_type, description, address, city, state, verification_status)
VALUES 
    ('vend-001', 'vendor-001', 'Himalayan Stays', 'homestay', 'Premium mountain homestays and eco-lodges in Uttarakhand and Himachal Pradesh.', '123 Mountain Road', 'Shimla', 'Himachal Pradesh', 'verified'),
    ('vend-002', 'vendor-002', 'Adventure Kings', 'adventure', 'White-water rafting, trekking, and outdoor adventure experiences across India.', '456 River Bank', 'Rishikesh', 'Uttarakhand', 'verified')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE USERS
-- ============================================
INSERT INTO users (id, name, email, password, phone, role, is_active)
VALUES 
    ('user-001', 'Sandeep Bendre', 'sandeep@example.com', '$2a$10$YourHashedPasswordHere', '+91 98765 43210', 'user', 1),
    ('user-002', 'Sarah Jenkins', 'sarah@example.com', '$2a$10$YourHashedPasswordHere', '+1 415 555 0199', 'user', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE LISTINGS
-- ============================================
INSERT INTO listings (id, vendor_id, title, tagline, description, category, location_address, location_city, location_state, price_inr, price_usd, price_unit, max_guests, images, amenities, status, rating, review_count)
VALUES 
    ('stay-01', 'vend-001', 'The Whispering Pines Glass Chalet', 'Wake up to pine trees through glass ceilings', 'A luxury glass chalet nestled in the pine forests of Shimla. Perfect for couples and small families looking for a peaceful mountain retreat with modern amenities.', 'homestay', 'Pine Valley Road', 'Shimla', 'Himachal Pradesh', 10830, 130, 'night', 6, '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"]', '["WiFi","Mountain View","Fireplace","Private Hot Tub","Parking","Kitchen"]', 'approved', 5.0, 2),
    ('adv-01', 'vend-002', 'White-Water Rafting Adventure', 'Thrilling rapids through the Ganges', 'Experience the adrenaline rush of white-water rafting on the Ganges river with professional guides and safety equipment.', 'adventure', 'Laxman Jhula', 'Rishikesh', 'Uttarakhand', 2508, 30, 'person', 10, '["https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80"]', '["Life Jacket","Helmet","Professional Guide","Photography"]', 'approved', 4.8, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE BOOKINGS
-- ============================================
INSERT INTO bookings (id, user_id, listing_id, check_in_date, check_out_date, guests_count, total_amount_inr, total_amount_usd, paid_amount, paid_currency, payment_gateway, payment_id, order_id, status)
VALUES 
    ('BK-8901', 'user-001', 'stay-01', '2026-08-10', '2026-08-12', 2, 21660, 262, 21660, 'INR', 'Razorpay', 'pay_Rzp908123471', 'order_Rzp8901', 'confirmed'),
    ('BK-8902', 'user-002', 'adv-01', '2026-08-14', '2026-08-14', 2, 5016, 60, 60, 'USD', 'PayPal', 'PAYPAL-TXN-90214', 'PP-ORDER-8902', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE REVIEWS
-- ============================================
INSERT INTO reviews (id, user_id, listing_id, booking_id, rating, comment, sub_ratings, is_verified)
VALUES 
    ('rev-001', 'user-001', 'stay-01', 'BK-8901', 5, 'An absolute masterpiece of a cabin! Waking up to pine trees through the glass ceiling was unreal.', '{"cleanliness":5,"accuracy":5,"communication":5,"location":5,"value":5}', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEFAULT COMMISSIONS
-- ============================================
INSERT INTO commissions (id, category, percentage)
VALUES 
    ('comm-001', 'hotel', 12.0),
    ('comm-002', 'resort', 12.0),
    ('comm-003', 'villa', 10.0),
    ('comm-004', 'homestay', 10.0),
    ('comm-005', 'hostel', 8.0),
    ('comm-006', 'camp', 10.0),
    ('comm-007', 'adventure', 15.0),
    ('comm-008', 'workshop', 12.0),
    ('comm-009', 'event', 10.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AVAILABILITY FOR SAMPLE LISTINGS
-- ============================================
INSERT INTO availability (id, listing_id, date, total_slots, booked_slots)
VALUES 
    ('avail-001', 'stay-01', '2026-08-10', 3, 1),
    ('avail-002', 'stay-01', '2026-08-11', 3, 1),
    ('avail-003', 'stay-01', '2026-08-12', 3, 0),
    ('avail-004', 'adv-01', '2026-08-14', 10, 2),
    ('avail-005', 'adv-01', '2026-08-15', 10, 0)
ON CONFLICT (id) DO NOTHING;
