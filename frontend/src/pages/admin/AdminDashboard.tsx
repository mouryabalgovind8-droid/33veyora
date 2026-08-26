import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Package, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVendors: number;
  pendingListings: number;
  pendingRefunds: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard();
      // API returns { stats: { users, vendors, listings, bookings, ... } }
      const s = data?.stats || data;
      setStats({
        totalUsers: s.users || s.totalUsers || 0,
        totalVendors: s.vendors || s.totalVendors || 0,
        totalListings: s.listings || s.totalListings || 0,
        totalBookings: s.bookings || s.totalBookings || 0,
        totalRevenue: s.totalRevenue || 0,
        pendingVendors: s.pendingVendors || 0,
        pendingListings: s.pendingListings || 0,
        pendingRefunds: s.pendingRefunds || 0,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-700 font-medium">{error}</p>
        <button 
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-blue-100 text-blue-600',
      change: '+12%',
      up: true
    },
    { 
      label: 'Total Vendors', 
      value: stats?.totalVendors || 0, 
      icon: Building2, 
      color: 'bg-purple-100 text-purple-600',
      change: '+8%',
      up: true
    },
    { 
      label: 'Total Listings', 
      value: stats?.totalListings || 0, 
      icon: Package, 
      color: 'bg-green-100 text-green-600',
      change: '+15%',
      up: true
    },
    { 
      label: 'Total Bookings', 
      value: stats?.totalBookings || 0, 
      icon: Calendar, 
      color: 'bg-amber-100 text-amber-600',
      change: '+22%',
      up: true
    },
  ];

  const pendingCards = [
    { 
      label: 'Pending Vendors', 
      value: stats?.pendingVendors || 0, 
      icon: Clock, 
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      label: 'Pending Listings', 
      value: stats?.pendingListings || 0, 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-600'
    },
    { 
      label: 'Pending Refunds', 
      value: stats?.pendingRefunds || 0, 
      icon: AlertTriangle, 
      color: 'bg-red-100 text-red-600'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your platform</p>
        </div>
        <button
          onClick={fetchDashboard}
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
            <p className="text-slate-300 text-sm">Total Revenue</p>
            <p className="text-4xl font-bold mt-1">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>18% from last month</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <ArrowUpRight className="h-3 w-3" />
                {card.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pendingCards.map((card) => (
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
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/admin/vendors" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Users className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Review Vendors</span>
          </a>
          <a href="/admin/listings" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Package className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Review Listings</span>
          </a>
          <a href="/admin/refunds" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <DollarSign className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Process Refunds</span>
          </a>
          <a href="/admin/commission" className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Commission Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
}
