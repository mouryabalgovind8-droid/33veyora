import api from './api';

export interface Listing {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  price: {
    amountINR: number;
    amountUSD: number;
    unit: string;
  };
  images: string[];
  amenities: string[];
  maxGuests: number;
  rating: number;
  reviewCount: number;
  status: string;
  vendor: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface ListingFilters {
  category?: string;
  search?: string;
  maxPrice?: number;
  city?: string;
  page?: number;
  limit?: number;
}

export const listingApi = {
  getAll: async (filters?: ListingFilters) => {
    const response = await api.get('/listings', { params: filters });
    const raw = response.data?.listings || response.data;
    if (!Array.isArray(raw)) return raw;
    return raw.map((l: any) => {
      let images: string[] = [];
      try { images = typeof l.images === 'string' ? JSON.parse(l.images) : (l.images || []); } catch { images = []; }
      let amenities: string[] = [];
      try { amenities = typeof l.amenities === 'string' ? JSON.parse(l.amenities) : (l.amenities || []); } catch { amenities = []; }
      return {
        id: l.id,
        title: l.title,
        tagline: l.tagline || '',
        description: l.description || '',
        category: l.category,
        location: {
          address: l.location_address || '',
          city: l.location_city || '',
          state: l.location_state || '',
          country: l.location_country || 'India',
        },
        price: {
          amountINR: l.price_inr || 0,
          amountUSD: l.price_usd || 0,
          unit: l.price_unit || 'night',
        },
        images,
        amenities,
        maxGuests: l.max_guests || 2,
        rating: l.rating || 0,
        reviewCount: l.review_count || 0,
        status: l.status,
        vendor: {
          id: l.vendor_id || '',
          name: l.vendor_name || 'Host',
          avatar: '',
        },
      };
    });
  },

  getById: async (id: string) => {
    const response = await api.get(`/listings/${id}`);
    const raw = response.data?.listing || response.data;
    // Transform snake_case DB fields to camelCase for frontend
    let images: string[] = [];
    try { images = typeof raw.images === 'string' ? JSON.parse(raw.images) : (raw.images || []); } catch { images = []; }
    let amenities: string[] = [];
    try { amenities = typeof raw.amenities === 'string' ? JSON.parse(raw.amenities) : (raw.amenities || []); } catch { amenities = []; }
    return {
      id: raw.id,
      title: raw.title,
      tagline: raw.tagline || '',
      description: raw.description || '',
      category: raw.category,
      location: {
        address: raw.location_address || raw.location?.address || '',
        city: raw.location_city || raw.location?.city || '',
        state: raw.location_state || raw.location?.state || '',
        country: raw.location_country || raw.location?.country || 'India',
      },
      price: {
        amountINR: raw.price_inr || raw.price?.amountINR || 0,
        amountUSD: raw.price_usd || raw.price?.amountUSD || 0,
        unit: raw.price_unit || raw.price?.unit || 'night',
      },
      images,
      amenities,
      maxGuests: raw.max_guests || raw.maxGuests || 2,
      rating: raw.rating || 0,
      reviewCount: raw.review_count || raw.reviewCount || 0,
      status: raw.status,
      vendor: {
        id: raw.vendor_id || raw.vendor?.id || '',
        name: raw.vendor_name || raw.vendor?.name || 'Host',
        avatar: raw.vendor?.avatar || '',
      },
      checkInTime: raw.check_in_time || '14:00',
      checkOutTime: raw.check_out_time || '11:00',
      rules: raw.rules || '',
      cancellationPolicy: raw.cancellation_policy || '',
    };
  },

  create: async (data: Partial<Listing>) => {
    const response = await api.post('/listings', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Listing>) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  getVendorListings: async (vendorId: string) => {
    const response = await api.get(`/vendors/${vendorId}/listings`);
    return response.data;
  },

  checkAvailability: async (listingId: string, date: string) => {
    const response = await api.get(`/listings/${listingId}/availability`, {
      params: { date }
    });
    return response.data;
  },
};
