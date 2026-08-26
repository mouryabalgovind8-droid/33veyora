import { useState, useEffect } from 'react';
import { 
  Package, 
  Edit2, 
  Trash2, 
  Eye,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

interface Listing {
  id: string;
  title: string;
  category: string;
  status: string;
  price: { amountINR: number };
  images: string[];
  maxGuests: number;
  rating: number;
  createdAt: string;
}

export default function VendorManageListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor/listings');
      setListings(Array.isArray(response.data) ? response.data : response.data.listings || []);
    } catch (err: any) {
      console.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter(l => l.id !== id));
    } catch (err: any) {
      alert('Failed to delete listing');
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500 mt-1">{listings.length} total listings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchListings}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href="/vendor/add-listing"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
          >
            + Add Listing
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                <Package className="h-12 w-12 text-slate-300" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(listing.status)}`}>
                  {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                </span>
              </div>
              <p className="text-sm text-slate-500 capitalize">{listing.category}</p>
              <p className="text-lg font-bold text-slate-900 mt-2">₹{(listing.price?.amountINR || 0).toLocaleString()}<span className="text-sm font-normal text-slate-500">/night</span></p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <a
                  href={`/listing/${listing.id}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
                >
                  <Eye className="h-4 w-4" /> View
                </a>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No listings found</p>
          <a href="/vendor/add-listing" className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800">
            Create Your First Listing
          </a>
        </div>
      )}
    </div>
  );
}
