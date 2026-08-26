import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface Listing {
  id: string;
  title: string;
  category: string;
  status: string;
  vendorId: string;
  createdAt: string;
  price?: number;
  location?: string;
  vendor?: {
    businessName: string;
  };
}

export default function ManageListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getListings();
      const raw = Array.isArray(data) ? data : data.listings || [];
      setListings(raw.map((l: any) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        status: l.status,
        vendorId: l.vendor_id || l.vendorId,
        createdAt: l.created_at || l.createdAt || new Date().toISOString(),
        price: l.price_inr || l.price?.amountINR || 0,
        location: l.location_city || l.location?.city || '',
        vendor: { businessName: l.vendor_name || l.vendor?.businessName || 'N/A' },
      })));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleApprove = async (listingId: string) => {
    try {
      await adminApi.approveListing(listingId);
      setListings(listings.map(l => 
        l.id === listingId ? { ...l, status: 'approved' } : l
      ));
    } catch (err: any) {
      alert('Failed to approve listing');
    }
  };

  const handleReject = async (listingId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await adminApi.rejectListing(listingId, reason);
      setListings(listings.map(l => 
        l.id === listingId ? { ...l, status: 'rejected' } : l
      ));
    } catch (err: any) {
      alert('Failed to reject listing');
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category?.toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-2xl font-bold text-slate-900">Manage Listings</h1>
          <p className="text-slate-500 mt-1">{listings.length} total listings</p>
        </div>
        <button
          onClick={fetchListings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-500" />
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
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Listing</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Vendor</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Created</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{listing.title}</p>
                      <p className="text-sm text-slate-500">ID: {listing.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 capitalize">{listing.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{listing.vendor?.businessName || 'N/A'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(listing.status)}`}>
                    {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {listing.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(listing.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(listing.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredListings.length === 0 && (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
