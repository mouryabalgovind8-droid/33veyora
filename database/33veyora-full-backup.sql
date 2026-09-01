--
-- PostgreSQL database dump
--

\restrict C8hCbTYYsXRfFbdB7L8HTzpG58CsJXXiWP6y8T92MXMxIXndEWLCTct2Ky8vi51

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.availability (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    listing_id text NOT NULL,
    date text NOT NULL,
    total_slots integer DEFAULT 1 NOT NULL,
    booked_slots integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.availability OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    user_id text NOT NULL,
    listing_id text NOT NULL,
    check_in_date text NOT NULL,
    check_out_date text NOT NULL,
    guests_count integer DEFAULT 1 NOT NULL,
    total_amount_inr integer NOT NULL,
    total_amount_usd integer NOT NULL,
    paid_amount integer NOT NULL,
    paid_currency text DEFAULT 'INR'::text NOT NULL,
    payment_gateway text DEFAULT 'Razorpay'::text NOT NULL,
    payment_id text,
    order_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    special_requests text,
    cancellation_reason text,
    refund_amount integer DEFAULT 0,
    refund_status text DEFAULT 'none'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    vendor_status text DEFAULT 'auto_confirmed'::text,
    vendor_response_at timestamp with time zone,
    reschedule_requested boolean DEFAULT false,
    new_check_in date,
    new_check_out date,
    reschedule_reason text,
    CONSTRAINT bookings_refund_status_check CHECK ((refund_status = ANY (ARRAY['none'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'processed'::text]))),
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text, 'refunded'::text])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    discount_type text DEFAULT 'percentage'::text,
    discount_value numeric(10,2),
    min_booking_amount numeric(10,2) DEFAULT 0,
    max_discount numeric(10,2),
    category text,
    listing_id text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    max_uses integer,
    current_uses integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: commissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commissions (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    category text NOT NULL,
    percentage real DEFAULT 10.0 NOT NULL,
    is_active integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.commissions OWNER TO postgres;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    vendor_id text NOT NULL,
    title text NOT NULL,
    tagline text,
    description text,
    category text NOT NULL,
    location_address text,
    location_city text,
    location_state text,
    location_country text DEFAULT 'India'::text,
    latitude real,
    longitude real,
    price_inr integer NOT NULL,
    price_usd integer NOT NULL,
    price_unit text DEFAULT 'night'::text NOT NULL,
    max_guests integer DEFAULT 1 NOT NULL,
    images text,
    amenities text,
    rules text,
    cancellation_policy text,
    min_days integer DEFAULT 1,
    max_days integer,
    status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    rating real DEFAULT 0,
    review_count integer DEFAULT 0,
    is_featured integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    property_type text DEFAULT 'standard'::text,
    room_type text,
    total_rooms integer DEFAULT 1,
    bed_type text,
    bathroom_type text,
    check_in_time text DEFAULT '14:00'::text,
    check_out_time text DEFAULT '11:00'::text,
    early_check_in boolean DEFAULT false,
    late_check_out boolean DEFAULT false,
    self_check_in boolean DEFAULT false,
    check_in_instructions text,
    start_time text,
    end_time text,
    duration_hours numeric(4,1),
    min_participants integer DEFAULT 1,
    max_participants integer,
    experience_subcategory text,
    difficulty_level text DEFAULT 'easy'::text,
    min_age integer DEFAULT 0,
    max_age integer,
    fitness_level text,
    safety_info text,
    what_to_bring text,
    equipment_provided text[],
    equipment_required text[],
    guide_name text,
    guide_bio text,
    guide_experience text,
    languages_spoken text[],
    weather_cancellation_policy text,
    weather_refund_percentage integer DEFAULT 100,
    safety_certificates text[],
    insurance_info text,
    current_booked_slots integer DEFAULT 0,
    event_start timestamp with time zone,
    event_end timestamp with time zone,
    prebooking_enabled boolean DEFAULT true,
    CONSTRAINT listings_category_check CHECK ((category = ANY (ARRAY['homestay'::text, 'hotel'::text, 'resort'::text, 'villa'::text, 'apartment'::text, 'guesthouse'::text, 'cottage'::text, 'hostel'::text, 'private_room'::text, 'camp'::text, 'luxury'::text, 'adventure'::text, 'workshop'::text, 'event'::text]))),
    CONSTRAINT listings_price_unit_check CHECK ((price_unit = ANY (ARRAY['night'::text, 'person'::text, 'session'::text]))),
    CONSTRAINT listings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'archived'::text])))
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: commission_report; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.commission_report AS
 SELECT l.category,
    count(b.id) AS total_bookings,
    sum(b.total_amount_inr) AS total_revenue,
    sum((((b.total_amount_inr)::double precision * COALESCE(c.percentage, (10)::real)) / (100)::double precision)) AS total_commission,
    COALESCE(c.percentage, (10)::real) AS commission_rate
   FROM ((public.bookings b
     JOIN public.listings l ON ((b.listing_id = l.id)))
     LEFT JOIN public.commissions c ON ((c.category = l.category)))
  WHERE (b.status = ANY (ARRAY['confirmed'::text, 'completed'::text]))
  GROUP BY l.category, c.percentage;


ALTER VIEW public.commission_report OWNER TO postgres;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disputes (
    id text NOT NULL,
    booking_id text NOT NULL,
    raised_by text NOT NULL,
    raised_against text,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'open'::text,
    admin_notes text,
    resolution text,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.disputes OWNER TO postgres;

--
-- Name: guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guides (
    id text NOT NULL,
    vendor_id text,
    name text NOT NULL,
    email text,
    phone text,
    bio text,
    specializations text[],
    languages text[],
    experience_years integer DEFAULT 0,
    certification text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.guides OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id text NOT NULL,
    name text NOT NULL,
    city text,
    state text,
    country text DEFAULT 'India'::text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    is_popular boolean DEFAULT false,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    booking_id text NOT NULL,
    sender_id text NOT NULL,
    content text NOT NULL,
    attachment_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data text,
    is_read integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    booking_id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    gateway text NOT NULL,
    transaction_id text,
    order_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    metadata text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text, 'refunded'::text])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payouts (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    vendor_id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    bank_account text,
    status text DEFAULT 'pending'::text NOT NULL,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT payouts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


ALTER TABLE public.payouts OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    user_id text NOT NULL,
    listing_id text NOT NULL,
    booking_id text,
    rating integer NOT NULL,
    comment text,
    sub_ratings text,
    host_response text,
    is_verified integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text,
    role text DEFAULT 'user'::text NOT NULL,
    avatar text,
    is_active integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['user'::text, 'vendor'::text, 'admin'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    user_id text NOT NULL,
    business_name text NOT NULL,
    business_type text,
    description text,
    address text,
    city text,
    state text,
    country text DEFAULT 'India'::text,
    logo text,
    verification_status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    documents text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT vendors_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist (
    id text DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    user_id text NOT NULL,
    listing_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wishlist OWNER TO postgres;

--
-- Data for Name: availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.availability (id, listing_id, date, total_slots, booked_slots, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, listing_id, check_in_date, check_out_date, guests_count, total_amount_inr, total_amount_usd, paid_amount, paid_currency, payment_gateway, payment_id, order_id, status, special_requests, cancellation_reason, refund_amount, refund_status, created_at, updated_at, vendor_status, vendor_response_at, reschedule_requested, new_check_in, new_check_out, reschedule_reason) FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, name, code, description, discount_type, discount_value, min_booking_amount, max_discount, category, listing_id, start_date, end_date, max_uses, current_uses, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: commissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commissions (id, category, percentage, is_active, created_at, updated_at) FROM stdin;
39acf3f0-ac4f-48d6-854a-70cf0db53207	homestay	10	1	2026-08-30 16:55:23.454229	2026-08-30 16:55:23.454229
cc3a28f4-97de-4346-b3a5-927ea649c54f	hotel	10	1	2026-08-30 16:55:23.456724	2026-08-30 16:55:23.456724
b6f966d3-ab78-4823-8333-5fab395bb60e	resort	10	1	2026-08-30 16:55:23.457395	2026-08-30 16:55:23.457395
e56895d0-2c97-446d-beb4-fff0332b98ea	villa	10	1	2026-08-30 16:55:23.457936	2026-08-30 16:55:23.457936
9984f6d8-1c50-4520-a3a2-5bbde1f4bab0	apartment	10	1	2026-08-30 16:55:23.458392	2026-08-30 16:55:23.458392
70799d3e-95d4-4a9d-b255-ecb5e5673cbe	guesthouse	10	1	2026-08-30 16:55:23.458822	2026-08-30 16:55:23.458822
40e79730-6710-4bc1-b891-408a891fdf03	cottage	10	1	2026-08-30 16:55:23.459369	2026-08-30 16:55:23.459369
c6d9518c-f8fb-4ec9-b0d6-77bb6a18f2cc	hostel	10	1	2026-08-30 16:55:23.459822	2026-08-30 16:55:23.459822
fd54b046-f7b8-4142-9431-ea43504667c8	private_room	10	1	2026-08-30 16:55:23.460312	2026-08-30 16:55:23.460312
28e6adcc-5b9d-4c92-bf97-39354a9fe34f	camp	10	1	2026-08-30 16:55:23.460801	2026-08-30 16:55:23.460801
b99d9b44-e3d6-460c-8d0e-db7a16b76d07	luxury	10	1	2026-08-30 16:55:23.461197	2026-08-30 16:55:23.461197
062f5a6d-6c3f-4c85-a88d-4f3d9313d88b	adventure	10	1	2026-08-30 16:55:23.461767	2026-08-30 16:55:23.461767
ea6c74fe-0853-44a1-b5b2-660656119e7a	workshop	10	1	2026-08-30 16:55:23.462432	2026-08-30 16:55:23.462432
8a279a84-7f94-4e4d-bffb-06053b76a906	event	10	1	2026-08-30 16:55:23.462885	2026-08-30 16:55:23.462885
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disputes (id, booking_id, raised_by, raised_against, reason, description, status, admin_notes, resolution, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guides (id, vendor_id, name, email, phone, bio, specializations, languages, experience_years, certification, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, vendor_id, title, tagline, description, category, location_address, location_city, location_state, location_country, latitude, longitude, price_inr, price_usd, price_unit, max_guests, images, amenities, rules, cancellation_policy, min_days, max_days, status, rejection_reason, rating, review_count, is_featured, created_at, updated_at, property_type, room_type, total_rooms, bed_type, bathroom_type, check_in_time, check_out_time, early_check_in, late_check_out, self_check_in, check_in_instructions, start_time, end_time, duration_hours, min_participants, max_participants, experience_subcategory, difficulty_level, min_age, max_age, fitness_level, safety_info, what_to_bring, equipment_provided, equipment_required, guide_name, guide_bio, guide_experience, languages_spoken, weather_cancellation_policy, weather_refund_percentage, safety_certificates, insurance_info, current_booked_slots, event_start, event_end, prebooking_enabled) FROM stdin;
1e005bcc-b042-49c4-af44-6283859dd83c	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	test 01	adsadasd	dasdsa	homestay	dsadsad	mumbai	maharashtra	India	\N	\N	5	5	night	2	["https://res.cloudinary.com/i33jzbog/image/upload/v1788093934/33veyora/listings/gznzt6x1netp1fxoo7m7.jpg"]	["WiFi","Kitchen","Room Service","Restaurant","Power Backup"]	["No smoking allowed"]	sasa	1	30	approved	\N	0	0	0	2026-08-30 18:15:56.859064	2026-08-30 18:15:56.859064	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
9839fb0b-bd70-4ddd-9653-236f017e55c8	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Grand Himalaya Business Hotel	Comfortable business stay in the heart of Jaipur	Modern rooms with city views, multi-cuisine restaurant and a rooftop lounge. Walking distance from Hawa Mahal and the old city bazaars. Ideal for both business trips and short family stays.	hotel	MI Road, near Hawa Mahal	Jaipur	Rajasthan	India	\N	\N	3500	42	night	3	["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]	["WiFi","AC","Breakfast included","Gym","24x7 reception"]	["Check-in 12 PM, check-out 11 AM. Valid government ID required at check-in."]	Free cancellation up to 48 hours before check-in.	1	30	approved	\N	4.6	89	1	2026-08-30 18:27:41.376468	2026-08-30 18:27:41.376468	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
ec4756dd-9cba-4917-a1ae-baa4c8a6a996	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Palm Grove Beach Resort	Beachfront luxury with endless sea views	A quiet beachfront resort tucked among palm groves with a sea-facing infinity pool, in-house spa and evening bonfires on the sand. Breakfast, lunch and dinner are included in the stay.	resort	Ashwem Beach Road	North Goa	Goa	India	\N	\N	7200	87	night	4	["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"]	["Private beach","Pool","Spa","All meals included","Water sports"]	["Check-in 2 PM, check-out 11 AM. No loud music after 10 PM."]	Free cancellation up to 48 hours before check-in.	1	30	approved	\N	4.8	156	1	2026-08-30 18:27:41.380822	2026-08-30 18:27:41.380822	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
157f5ed3-b68c-40c2-bd5b-92193581635a	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Sunset Pool Villa	Private pool villa overlooking the Aravallis	A three-bedroom private villa with an infinity pool, BBQ deck and sunset views over the Aravalli hills. Perfect for group getaways, family reunions and small celebrations.	villa	Sajjan Garh Road	Udaipur	Rajasthan	India	\N	\N	9800	118	night	8	["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"]	["Private pool","Valley view","Chef on call","Free parking","BBQ deck"]	["No parties. Check-in 1 PM. Maximum 8 guests allowed."]	Free cancellation up to 48 hours before check-in.	1	30	approved	\N	4.9	78	1	2026-08-30 18:27:41.382407	2026-08-30 18:27:41.382407	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
6cf886f5-82dc-4e9c-b866-6c53fbe423fd	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Cedar Wood Cozy Homestay	A warm mountain home with home-cooked food	A family-run cedar wood homestay in Old Manali with wooden interiors, a garden cafe and views of the snow peaks. Home-cooked Himachali meals served on request, and the host helps plan local treks.	homestay	Old Manali Road	Manali	Himachal Pradesh	India	\N	\N	2400	29	night	4	["https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"]	["Home-cooked meals","Mountain view","WiFi","Bonfire","Local guide"]	["Check-in 12 PM. No smoking indoors. Dinner on request before 7 PM."]	Free cancellation up to 48 hours before check-in.	1	30	approved	\N	4.7	112	1	2026-08-30 18:27:41.38395	2026-08-30 18:27:41.38395	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
8a369224-662a-4fbf-b283-f734cd182011	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Backpacker Hub Hostel	Budget beds, big friendships	A lively backpacker hostel a short walk from the Ganga ghats with dorm beds and private rooms, an in-house cafe and daily community activities like open mics and yoga mornings.	hostel	Tapovan, Laxman Jhula Road	Rishikesh	Uttarakhand	India	\N	\N	650	8	night	2	["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=80"]	["Free WiFi","Shared kitchen","Lockers","Game room","In-house cafe"]	["Common area quiet hours 10 PM to 7 AM. No outside guests in dorms."]	Free cancellation up to 48 hours before check-in.	1	30	approved	\N	4.4	203	0	2026-08-30 18:27:41.38538	2026-08-30 18:27:41.38538	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
9916ad55-b6ff-41ec-9b7c-013aef0c35d8	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Riverside Moonlight Camp	Sleep to the sound of the Ganga	Riverside Swiss tents on a white sand beach with bonfires, stargazing and evening snacks by the river. Meals included, and rafting pickup points are five minutes away.	camp	Byasi, Rishikesh Highway	Rishikesh	Uttarakhand	India	\N	\N	1800	22	night	2	["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80"]	["Riverside tents","Bonfire","Stargazing","Meals included"]	["No littering near the river. Campfire allowed till 11 PM only."]	Free cancellation up to 48 hours before check-in.	1	14	approved	\N	4.6	67	0	2026-08-30 18:27:41.38733	2026-08-30 18:27:41.38733	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
d3580618-03aa-4463-ad11-b5e61646a293	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Ganga Rapids Rafting Adventure	Conquer Grade III rapids with expert guides	A 16 km white-water rafting run from Shivpuri to Ram Jhula hitting the famous Grade III rapids — Roller Coaster, Golf Course and Three Blind Mice. Certified guides, full safety gear and GoPro photos included.	adventure	Shivpuri Rafting Put-in Point	Rishikesh	Uttarakhand	India	\N	\N	1500	18	person	6	["https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80"]	["Expert guide","Safety gear","Equipment","GoPro photos included"]	["Age 12 and above. Basic fitness required. Follow guide instructions at all times."]	Free cancellation up to 24 hours before start time.	1	\N	approved	\N	4.9	341	0	2026-08-30 18:27:41.389401	2026-08-30 18:27:41.389401	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
046cfd1b-7fdb-44ad-adfa-8522a0c1173d	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Terracotta Pottery Workshop	Shape clay with your own hands	A three-hour hands-on pottery session in a heritage courtyard studio in old Jaipur. Learn wheel throwing and hand-building from a local terracotta artist and take your creations home the same day.	workshop	Gopalbari, near Bani Park	Jaipur	Rajasthan	India	\N	\N	1200	15	session	10	["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80"]	["Materials included","Take your pottery home","Expert artist","Refreshments"]	["Reach 10 minutes early. Aprons provided. Wear comfortable clothes."]	Free cancellation up to 24 hours before start time.	1	\N	approved	\N	4.8	95	0	2026-08-30 18:27:41.391089	2026-08-30 18:27:41.391089	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	\N	\N	t
f32fe3ba-9b54-4d99-a84a-6c8ad4c07e93	e9bf953b-4a35-41e3-9c73-e0f5e96d6674	Goa Sunset Music Festival	An evening of live music, food and sunsets	An open-air sunset music festival on Vagator cliffs with three stages, indie and electronic acts, artisan food stalls and a beach after-party. Gates open at 4 PM, headliners close the night.	event	Vagator Cliff Road	North Goa	Goa	India	\N	\N	2500	30	person	5	["https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"]	["Live music","Food stalls","VIP zone","Parking"]	["Entry with e-ticket only. Outside food not allowed. Age 18 and above."]	Non-refundable after booking. Tickets are transferable to a friend.	1	\N	approved	\N	4.7	58	0	2026-08-30 18:27:41.392619	2026-08-30 18:27:41.392619	standard	\N	1	\N	\N	14:00	11:00	f	f	f	\N	\N	\N	\N	1	\N	\N	easy	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	100	\N	\N	0	2026-10-24 16:00:00+05:30	2026-10-24 23:30:00+05:30	t
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, name, city, state, country, latitude, longitude, is_popular, image_url, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, booking_id, sender_id, content, attachment_url, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, data, is_read, created_at) FROM stdin;
c277a7a5-db6d-4e5b-bef6-c17bb772e81e	122ed794-a663-4342-a4b7-f18440518735	vendor_approved	Vendor Approved	Your business "Himalay stays" has been verified and approved!	\N	0	2026-08-30 17:27:36.275119
8e637dae-5cdf-42bc-ba2f-7b59c66b5db2	122ed794-a663-4342-a4b7-f18440518735	listing_approved	Listing Approved	Your listing "test 01" has been approved and is now live!	\N	0	2026-08-30 18:17:53.134026
b1ebb10d-95e7-4d0f-aa35-a62b29303be2	122ed794-a663-4342-a4b7-f18440518735	new_booking	New Booking Received	You have a new booking for Goa Sunset Music Festival from 2026-10-24T10:30:00.000Z to 2026-10-24T18:00:00.000Z	{"bookingId":"BK-MTFT4BH9","listingId":"8c8804bf-9f01-4fa3-b31a-1750b2251e80"}	0	2026-08-30 18:20:00.871331
f71090e1-c89a-4e49-84aa-a40327b28bd3	122ed794-a663-4342-a4b7-f18440518735	booking_cancelled	Booking Cancelled	A booking for Goa Sunset Music Festival has been cancelled	{"bookingId":"BK-MTFT4BH9"}	0	2026-08-30 18:20:06.153148
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, booking_id, amount, currency, gateway, transaction_id, order_id, status, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payouts (id, vendor_id, amount, currency, bank_account, status, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, listing_id, booking_id, rating, comment, sub_ratings, host_response, is_verified, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, phone, role, avatar, is_active, created_at, updated_at) FROM stdin;
admin-1788087830938	Admin	33veyoraruyzaki@japan.com	$2a$10$5iiPQHSopEvqT5Kk5/B5KOjwu0G7CdHMx3bVrG9yilr/TYxue1Nn2	\N	admin	\N	1	2026-08-30 16:33:50.979154	2026-08-30 16:33:50.979154
122ed794-a663-4342-a4b7-f18440518735	ryuzaki	youknowminee@gmail.com	$2a$10$GCDXbsNS1IP7/pj3xd6/D.9gj1S.rxshQz04G6//h0qdEoEyV4Edi	\N	vendor	\N	1	2026-08-30 17:23:45.525298	2026-08-30 17:23:45.525298
d8ce46a7-b4fa-421d-a352-7025908ad3c6	KAIF ANSARI	youknowminee+21august@gmail.com	$2a$10$jmdpLGVc4tCdnXGPp2yv5usczWx/uxQKoquTtC1HPSsVQAkY9Jn/6	\N	user	\N	1	2026-08-30 18:19:25.134191	2026-08-30 18:19:25.134191
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, user_id, business_name, business_type, description, address, city, state, country, logo, verification_status, rejection_reason, documents, created_at, updated_at) FROM stdin;
e9bf953b-4a35-41e3-9c73-e0f5e96d6674	122ed794-a663-4342-a4b7-f18440518735	Himalay stays	\N	\N	\N	\N	\N	India	\N	verified	\N	\N	2026-08-30 17:23:45.531504	2026-08-30 17:23:45.531504
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist (id, user_id, listing_id, created_at) FROM stdin;
\.


--
-- Name: availability availability_listing_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_listing_id_date_key UNIQUE (listing_id, date);


--
-- Name: availability availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_code_key UNIQUE (code);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: guides guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guides
    ADD CONSTRAINT guides_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_key UNIQUE (user_id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_user_id_listing_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_listing_id_key UNIQUE (user_id, listing_id);


--
-- Name: idx_availability_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_availability_date ON public.availability USING btree (date);


--
-- Name: idx_availability_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_availability_listing_id ON public.availability USING btree (listing_id);


--
-- Name: idx_bookings_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_listing_id ON public.bookings USING btree (listing_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- Name: idx_listings_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_category ON public.listings USING btree (category);


--
-- Name: idx_listings_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_city ON public.listings USING btree (location_city);


--
-- Name: idx_listings_event_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_event_start ON public.listings USING btree (event_start);


--
-- Name: idx_listings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_status ON public.listings USING btree (status);


--
-- Name: idx_listings_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_vendor_id ON public.listings USING btree (vendor_id);


--
-- Name: idx_messages_booking_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_booking_id ON public.messages USING btree (booking_id);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_payments_booking_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);


--
-- Name: idx_reviews_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_listing_id ON public.reviews USING btree (listing_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_vendors_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_status ON public.vendors USING btree (verification_status);


--
-- Name: idx_vendors_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_user_id ON public.vendors USING btree (user_id);


--
-- Name: idx_wishlist_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlist_user_id ON public.wishlist USING btree (user_id);


--
-- Name: availability availability_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: listings listings_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: messages messages_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: payouts payouts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict C8hCbTYYsXRfFbdB7L8HTzpG58CsJXXiWP6y8T92MXMxIXndEWLCTct2Ky8vi51

