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
  // Dashboard & analytics
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Users
  getUsers: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (id: string) => {
    const response = await api.post(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // Vendors
  getVendors: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/vendors', { params });
    return response.data;
  },

  approveVendor: async (id: string) => {
    const response = await api.post(`/admin/vendors/${id}/approve`);
    return response.data;
  },

  rejectVendor: async (id: string, reason: string) => {
    const response = await api.post(`/admin/vendors/${id}/reject`, { reason });
    return response.data;
  },

  // Listings
  getListings: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  },

  approveListing: async (id: string) => {
    const response = await api.post(`/admin/listings/${id}/approve`);
    return response.data;
  },

  rejectListing: async (id: string, reason: string) => {
    const response = await api.post(`/admin/listings/${id}/reject`, { reason });
    return response.data;
  },

  // Bookings (view + filter for admin)
  getBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  // Refunds — backend exposes a single process endpoint (approve | reject)
  getRefunds: async () => {
    const response = await api.get('/admin/refunds');
    return response.data;
  },

  processRefund: async (id: string, action: 'approve' | 'reject') => {
    const response = await api.post(`/admin/refunds/${id}/process`, { action });
    return response.data;
  },

  // Commissions
  getCommissions: async () => {
    const response = await api.get('/admin/commissions');
    return response.data;
  },

  updateCommission: async (category: string, percentage: number) => {
    const response = await api.put(`/admin/commissions/${encodeURIComponent(category)}`, { percentage });
    return response.data;
  },

  // Categories (system categories with live listing counts)
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  // Review moderation
  getReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },

  moderateReview: async (id: string, action: 'approve' | 'reject') => {
    const response = await api.post(`/admin/reviews/${id}/moderate`, { action });
    return response.data;
  },
};
