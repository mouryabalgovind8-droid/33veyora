-- ============================================
-- SEED 002: Demo listings for the demo vendor ("Himalay stays")
-- 1 listing per category (9 total): hotel, resort, villa, homestay,
-- hostel, camp, adventure, workshop, event
-- All inserted as status='approved' so they show on Home/Search.
-- 4 stays flagged is_featured=1 for the "Featured stays" home section.
--
-- Idempotent: re-running this file first deletes the same 9 titles
-- for this vendor, then re-inserts them. All listings belong to the
-- demo vendor (looked up by email) — deleting that vendor/user will
-- cascade-delete all of these listings.
-- ============================================

-- Cleanup previous seed run (same 9 titles only — touches nothing else)
DELETE FROM listings
WHERE vendor_id = (
    SELECT id FROM vendors
    WHERE user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com')
)
AND title IN (
    'Grand Himalaya Business Hotel',
    'Palm Grove Beach Resort',
    'Sunset Pool Villa',
    'Cedar Wood Cozy Homestay',
    'Backpacker Hub Hostel',
    'Riverside Moonlight Camp',
    'Ganga Rapids Rafting Adventure',
    'Terracotta Pottery Workshop',
    'Goa Sunset Music Festival'
);

-- 1. HOTEL
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Grand Himalaya Business Hotel',
    'Comfortable business stay in the heart of Jaipur',
    'Modern rooms with city views, multi-cuisine restaurant and a rooftop lounge. Walking distance from Hawa Mahal and the old city bazaars. Ideal for both business trips and short family stays.',
    'hotel',
    'MI Road, near Hawa Mahal', 'Jaipur', 'Rajasthan',
    3500, 42, 'night', 3,
    '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]',
    '["WiFi","AC","Breakfast included","Gym","24x7 reception"]',
    '["Check-in 12 PM, check-out 11 AM. Valid government ID required at check-in."]',
    'Free cancellation up to 48 hours before check-in.',
    1, 30, 'approved', 4.6, 89, 1
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 2. RESORT
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Palm Grove Beach Resort',
    'Beachfront luxury with endless sea views',
    'A quiet beachfront resort tucked among palm groves with a sea-facing infinity pool, in-house spa and evening bonfires on the sand. Breakfast, lunch and dinner are included in the stay.',
    'resort',
    'Ashwem Beach Road', 'North Goa', 'Goa',
    7200, 87, 'night', 4,
    '["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"]',
    '["Private beach","Pool","Spa","All meals included","Water sports"]',
    '["Check-in 2 PM, check-out 11 AM. No loud music after 10 PM."]',
    'Free cancellation up to 48 hours before check-in.',
    1, 30, 'approved', 4.8, 156, 1
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 3. VILLA
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Sunset Pool Villa',
    'Private pool villa overlooking the Aravallis',
    'A three-bedroom private villa with an infinity pool, BBQ deck and sunset views over the Aravalli hills. Perfect for group getaways, family reunions and small celebrations.',
    'villa',
    'Sajjan Garh Road', 'Udaipur', 'Rajasthan',
    9800, 118, 'night', 8,
    '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"]',
    '["Private pool","Valley view","Chef on call","Free parking","BBQ deck"]',
    '["No parties. Check-in 1 PM. Maximum 8 guests allowed."]',
    'Free cancellation up to 48 hours before check-in.',
    1, 30, 'approved', 4.9, 78, 1
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 4. HOMESTAY
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Cedar Wood Cozy Homestay',
    'A warm mountain home with home-cooked food',
    'A family-run cedar wood homestay in Old Manali with wooden interiors, a garden cafe and views of the snow peaks. Home-cooked Himachali meals served on request, and the host helps plan local treks.',
    'homestay',
    'Old Manali Road', 'Manali', 'Himachal Pradesh',
    2400, 29, 'night', 4,
    '["https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"]',
    '["Home-cooked meals","Mountain view","WiFi","Bonfire","Local guide"]',
    '["Check-in 12 PM. No smoking indoors. Dinner on request before 7 PM."]',
    'Free cancellation up to 48 hours before check-in.',
    1, 30, 'approved', 4.7, 112, 1
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 5. HOSTEL
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Backpacker Hub Hostel',
    'Budget beds, big friendships',
    'A lively backpacker hostel a short walk from the Ganga ghats with dorm beds and private rooms, an in-house cafe and daily community activities like open mics and yoga mornings.',
    'hostel',
    'Tapovan, Laxman Jhula Road', 'Rishikesh', 'Uttarakhand',
    650, 8, 'night', 2,
    '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=80"]',
    '["Free WiFi","Shared kitchen","Lockers","Game room","In-house cafe"]',
    '["Common area quiet hours 10 PM to 7 AM. No outside guests in dorms."]',
    'Free cancellation up to 48 hours before check-in.',
    1, 30, 'approved', 4.4, 203, 0
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 6. CAMP
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Riverside Moonlight Camp',
    'Sleep to the sound of the Ganga',
    'Riverside Swiss tents on a white sand beach with bonfires, stargazing and evening snacks by the river. Meals included, and rafting pickup points are five minutes away.',
    'camp',
    'Byasi, Rishikesh Highway', 'Rishikesh', 'Uttarakhand',
    1800, 22, 'night', 2,
    '["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80"]',
    '["Riverside tents","Bonfire","Stargazing","Meals included"]',
    '["No littering near the river. Campfire allowed till 11 PM only."]',
    'Free cancellation up to 48 hours before check-in.',
    1, 14, 'approved', 4.6, 67, 0
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 7. ADVENTURE
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Ganga Rapids Rafting Adventure',
    'Conquer Grade III rapids with expert guides',
    'A 16 km white-water rafting run from Shivpuri to Ram Jhula hitting the famous Grade III rapids — Roller Coaster, Golf Course and Three Blind Mice. Certified guides, full safety gear and GoPro photos included.',
    'adventure',
    'Shivpuri Rafting Put-in Point', 'Rishikesh', 'Uttarakhand',
    1500, 18, 'person', 6,
    '["https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80"]',
    '["Expert guide","Safety gear","Equipment","GoPro photos included"]',
    '["Age 12 and above. Basic fitness required. Follow guide instructions at all times."]',
    'Free cancellation up to 24 hours before start time.',
    1, NULL, 'approved', 4.9, 341, 0
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 8. WORKSHOP
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured)
SELECT v.id,
    'Terracotta Pottery Workshop',
    'Shape clay with your own hands',
    'A three-hour hands-on pottery session in a heritage courtyard studio in old Jaipur. Learn wheel throwing and hand-building from a local terracotta artist and take your creations home the same day.',
    'workshop',
    'Gopalbari, near Bani Park', 'Jaipur', 'Rajasthan',
    1200, 15, 'session', 10,
    '["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80"]',
    '["Materials included","Take your pottery home","Expert artist","Refreshments"]',
    '["Reach 10 minutes early. Aprons provided. Wear comfortable clothes."]',
    'Free cancellation up to 24 hours before start time.',
    1, NULL, 'approved', 4.8, 95, 0
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');

-- 9. EVENT (with schedule + pre-booking enabled)
INSERT INTO listings (vendor_id, title, tagline, description, category,
    location_address, location_city, location_state, price_inr, price_usd, price_unit,
    max_guests, images, amenities, rules, cancellation_policy, min_days, max_days,
    status, rating, review_count, is_featured,
    event_start, event_end, prebooking_enabled)
SELECT v.id,
    'Goa Sunset Music Festival',
    'An evening of live music, food and sunsets',
    'An open-air sunset music festival on Vagator cliffs with three stages, indie and electronic acts, artisan food stalls and a beach after-party. Gates open at 4 PM, headliners close the night.',
    'event',
    'Vagator Cliff Road', 'North Goa', 'Goa',
    2500, 30, 'person', 5,
    '["https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"]',
    '["Live music","Food stalls","VIP zone","Parking"]',
    '["Entry with e-ticket only. Outside food not allowed. Age 18 and above."]',
    'Non-refundable after booking. Tickets are transferable to a friend.',
    1, NULL, 'approved', 4.7, 58, 0,
    '2026-10-24 16:00:00+05:30', '2026-10-24 23:30:00+05:30', true
FROM vendors v
WHERE v.user_id = (SELECT id FROM users WHERE email = 'youknowminee@gmail.com');
