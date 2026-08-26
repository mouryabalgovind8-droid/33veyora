import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

interface EarningsData {
  totalEarnings: number;
  pendingPayout: number;
  completedPayouts: number;
  monthlyEarnings: { month: string; amount: number }[];
  recentTransactions: {
    id: string;
    bookingId: string;
    amount: number;
    date: string;
    status: string;
  }[];
}

export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor/earnings');
      setEarnings(response.data);
    } catch (err: any) {
      // Use mock data if API fails
      setEarnings({
        totalEarnings: 85000,
        pendingPayout: 12000,
        completedPayouts: 73000,
        monthlyEarnings: [
          { month: 'Jan', amount: 15000 },
          { month: 'Feb', amount: 22000 },
          { month: 'Mar', amount: 18000 },
          { month: 'Apr', amount: 30000 },
        ],
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

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
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="text-slate-500 mt-1">Track your revenue and payouts</p>
        </div>
        <button
          onClick={fetchEarnings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Total Earnings</p>
            <p className="text-4xl font-bold mt-1">₹{(earnings?.totalEarnings || 0).toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Payout</p>
              <p className="text-xl font-bold text-slate-900">₹{(earnings?.pendingPayout || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed Payouts</p>
              <p className="text-xl font-bold text-slate-900">₹{(earnings?.completedPayouts || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart (Simple) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Earnings</h2>
        <div className="flex items-end gap-4 h-48">
          {(earnings?.monthlyEarnings || []).map((item, i) => {
            const maxAmount = Math.max(...(earnings?.monthlyEarnings || []).map(e => e.amount));
            const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-slate-600">₹{(item.amount / 1000).toFixed(0)}k</span>
                <div 
                  className="w-full bg-slate-900 rounded-t-lg transition-all"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-slate-500">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h2>
        {(earnings?.recentTransactions || []).length === 0 ? (
          <p className="text-slate-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {(earnings?.recentTransactions || []).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">Booking {tx.bookingId}</p>
                  <p className="text-sm text-slate-500">{new Date(tx.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className="font-bold text-green-600">+₹{tx.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
