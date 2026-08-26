import api from './api';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmountINR: number;
  totalAmountUSD: number;
  paidAmount: number;
  paidCurrency: string;
  status: string;
  createdAt: string;
}

export interface CreateBookingData {
  listingId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  specialRequests?: string;
  paymentGateway: 'Razorpay' | 'PayPal';
  paidCurrency: 'INR' | 'USD';
}

export const bookingApi = {
  create: async (data: CreateBookingData) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  getVendorBookings: async (vendorId: string) => {
    const response = await api.get(`/vendors/${vendorId}/bookings`);
    return response.data;
  },
};
