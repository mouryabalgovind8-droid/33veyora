import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Filter
} from 'lucide-react';
import { bookingApi, Booking } from '../../services/booking.api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getMyBookings();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancel(bookingId);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter(b => 
    filter === 'all' || b.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500 mb-6">{bookings.length} total bookings</p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h2>
            <p className="text-slate-500">
              {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {booking.listingImage ? (
                    <img src={booking.listingImage} alt="" className="w-24 h-24 rounded-xl object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">{booking.listingTitle || 'Booking'}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(booking.status)}`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.checkInDate).toLocaleDateString('en-IN')} → {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
                      </span>
                      <span>{booking.guestsCount} guests</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-lg font-bold text-slate-900">₹{(booking.totalAmountINR || 0).toLocaleString()}</p>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
