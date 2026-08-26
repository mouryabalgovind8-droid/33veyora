import api from './api';

export interface AdminDashboard {
  totalUsers: number;
  totalVendors: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVendors: number;
  pendingListings: number;
  pendingRefunds: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  verificationStatus: string;
  createdAt: string;
  user: User;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  status: string;
  vendorId: string;
  createdAt: string;
  vendor: Vendor;
}

export const adminApi = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (page = 1, limit = 20) => {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  // Vendors
  getVendors: async (status?: string, page = 1, limit = 20) => {
    const response = await api.get('/admin/vendors', { params: { status, page, limit } });
    return response.data;
  },

  getVendor: async (id: string) => {
    const response = await api.get(`/admin/vendors/${id}`);
    return response.data;
  },

  approveVendor: async (id: string) => {
    const response = await api.put(`/admin/vendors/${id}/approve`);
    return response.data;
  },

  rejectVendor: async (id: string, reason: string) => {
    const response = await api.put(`/admin/vendors/${id}/reject`, { reason });
    return response.data;
  },

  // Listings
  getListings: async (status?: string, page = 1, limit = 20) => {
    const response = await api.get('/admin/listings', { params: { status, page, limit } });
    return response.data;
  },

  getListing: async (id: string) => {
    const response = await api.get(`/admin/listings/${id}`);
    return response.data;
  },

  approveListing: async (id: string) => {
    const response = await api.put(`/admin/listings/${id}/approve`);
    return response.data;
  },

  rejectListing: async (id: string, reason: string) => {
    const response = await api.put(`/admin/listings/${id}/reject`, { reason });
    return response.data;
  },

  // Bookings
  getBookings: async (status?: string, page = 1, limit = 20) => {
    const response = await api.get('/admin/bookings', { params: { status, page, limit } });
    return response.data;
  },

  // Refunds
  getRefunds: async (status?: string) => {
    const response = await api.get('/admin/refunds', { params: { status } });
    return response.data;
  },

  approveRefund: async (bookingId: string) => {
    const response = await api.put(`/admin/refunds/${bookingId}/approve`);
    return response.data;
  },

  rejectRefund: async (bookingId: string, reason: string) => {
    const response = await api.put(`/admin/refunds/${bookingId}/reject`, { reason });
    return response.data;
  },

  // Commissions
  getCommissions: async () => {
    const response = await api.get('/admin/commissions');
    return response.data;
  },

  updateCommission: async (category: string, percentage: number) => {
    const response = await api.put(`/admin/commissions/${category}`, { percentage });
    return response.data;
  },

  // Reports
  getRevenueReport: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/admin/reports/revenue', { params: { startDate, endDate } });
    return response.data;
  },

  getBookingReport: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/admin/reports/bookings', { params: { startDate, endDate } });
    return response.data;
  },
};
