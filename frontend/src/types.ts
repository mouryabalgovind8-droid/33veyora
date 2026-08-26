export type CategoryType = 'all' | 'homestay' | 'hotel' | 'resort' | 'villa' | 'hostel' | 'camp' | 'event' | 'adventure' | 'workshop';

export type Currency = 'INR' | 'USD';

export interface Listing {
  id: string;
  title: string;
  category: CategoryType;
  tagline: string;
  description: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  price: {
    amountINR: number;
    amountUSD: number;
    unit: 'night' | 'person' | 'session';
  };
  images: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    superhost: boolean;
    joinedYear: string;
    responseRate: string;
    bio: string;
  };
  rating: number;
  reviewCount: number;
  subRatings: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
  };
  maxGuests: number;
  amenities: string[];
  includedItems?: string[];
  availability: {
    bookedDates: string[]; // YYYY-MM-DD
    availableSlots?: { time: string; slotsLeft: number }[];
  };
  rules?: string[];
  featured?: boolean;
}

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  category: CategoryType;
  hostName: string;
  hostAvatar: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmountINR: number;
  totalAmountUSD: number;
  paidAmount: number;
  paidCurrency: Currency;
  paymentGateway: 'Razorpay' | 'PayPal';
  paymentId: string;
  orderId: string;
  bookingStatus: BookingStatus;
  createdAt: string;
  specialRequests?: string;
}

export interface Review {
  id: string;
  listingId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
  subRatings?: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
  };
  verifiedBooking: boolean;
  hostResponse?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'guest' | 'host' | 'system';
  content: string;
  timestamp: string;
  isEncrypted: boolean;
  attachmentUrl?: string;
}

export interface EmailNotification {
  id: string;
  type: 'booking_confirmation' | 'host_alert' | 'payment_receipt' | 'checkin_reminder' | 'cancellation_notice';
  recipientEmail: string;
  recipientName: string;
  recipientRole: 'guest' | 'host';
  subject: string;
  sentAt: string;
  htmlBody: string;
  status: 'sent' | 'delivered' | 'failed';
}

export interface AnalyticsSummary {
  totalRevenueINR: number;
  totalRevenueUSD: number;
  totalBookings: number;
  occupancyRate: number;
  averageRating: number;
  monthlyRevenue: { month: string; revenueINR: number; bookingsCount: number }[];
  categoryBreakdown: { category: string; amountINR: number; count: number }[];
}
