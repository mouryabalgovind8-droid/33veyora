import { useState } from 'react';
import { 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Search
} from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  listingName: string;
  listingLocation: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: Date;
}

const mockBookings: Booking[] = [
  {
    id: 'BK001',
    guestName: 'Priya Sharma',
    guestEmail: 'priya@email.com',
    listingName: 'Luxury Villa in Goa',
    listingLocation: 'Goa, India',
    checkIn: new Date('2024-02-15'),
    checkOut: new Date('2024-02-18'),
    guests: 4,
    totalAmount: 25500,
    status: 'pending',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'BK002',
    guestName: 'Rahul Verma',
    guestEmail: 'rahul@email.com',
    listingName: 'Mountain View Cabin',
    listingLocation: 'Manali, India',
    checkIn: new Date('2024-02-20'),
    checkOut: new Date('2024-02-22'),
    guests: 2,
    totalAmount: 8000,
    status: 'confirmed',
    createdAt: new Date('2024-02-12'),
  },
  {
    id: 'BK003',
    guestName: 'Ananya Patel',
    guestEmail: 'ananya@email.com',
    listingName: 'Heritage Haveli Stay',
    listingLocation: 'Jaipur, India',
    checkIn: new Date('2024-01-25'),
    checkOut: new Date('2024-01-28'),
    guests: 3,
    totalAmount: 15000,
    status: 'completed',
    createdAt: new Date('2024-01-20'),
  },
];

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.listingName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const handleAccept = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
    ));
  };
  
  const handleReject = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
    ));
  };
  
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-1">
            {pendingCount > 0 ? `${pendingCount} pending bookings require your attention` : 'Manage your booking requests'}
          </p>
        </div>
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
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest or listing name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div 
            key={booking.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{booking.guestName}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{booking.guestEmail}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {booking.listingName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{booking.listingLocation}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{booking.guests} guests</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">₹{booking.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Total amount</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
              {booking.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleAccept(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              ) : (
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
        
        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500">
              {filter === 'all' 
                ? "You don't have any bookings yet."
                : `No ${filter} bookings found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
