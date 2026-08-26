import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface Booking {
  id: string;
  listingId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  listing?: { title: string };
  user?: { name: string; email: string };
}

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBookings();
      const raw = Array.isArray(data) ? data : data.bookings || [];
      setBookings(raw.map((b: any) => ({
        id: b.id,
        listingId: b.listing_id || b.listingId,
        userId: b.user_id || b.userId,
        checkInDate: b.check_in_date || b.checkInDate,
        checkOutDate: b.check_out_date || b.checkOutDate,
        guestsCount: b.guests_count || b.guestsCount || 1,
        totalAmount: b.total_amount_inr || b.totalAmount || 0,
        status: b.status,
        createdAt: b.created_at || b.createdAt || new Date().toISOString(),
        listing: { title: b.listing_title || 'Booking' },
        user: { name: b.guest_name || 'Guest', email: '' },
      })));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-500';
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
          <h1 className="text-2xl font-bold text-slate-900">Manage Bookings</h1>
          <p className="text-slate-500 mt-1">{bookings.length} total bookings</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {bookings.filter(b => b.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings..."
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
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Booking ID</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Guest</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Listing</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Dates</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Amount</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-slate-900">{booking.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{booking.user?.name || 'N/A'}</p>
                    <p className="text-sm text-slate-500">{booking.user?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{booking.listing?.title || 'N/A'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600">
                    <p>{new Date(booking.checkInDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-slate-400">to {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">₹{(booking.totalAmount || 0).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(booking.status)}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
