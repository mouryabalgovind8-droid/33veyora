import { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

interface VendorStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  averageRating: number;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor/dashboard');
      setStats(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Listings', value: stats?.totalListings || 0, icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your overview.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm">Total Earnings</p>
            <p className="text-4xl font-bold mt-1">₹{(stats?.totalEarnings || 0).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
            <span className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/vendor/add-listing" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Package className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Add Listing</span>
          </a>
          <a href="/vendor/bookings" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Calendar className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">View Bookings</span>
          </a>
          <a href="/vendor/earnings" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <DollarSign className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Earnings</span>
          </a>
          <a href="/vendor/kyc" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <AlertTriangle className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">KYC</span>
          </a>
        </div>
      </div>
    </div>
  );
}
