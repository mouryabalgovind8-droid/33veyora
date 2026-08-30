import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface Refund {
  id: string;
  bookingId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  listing?: { title: string };
}

export default function ManageRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRefunds();
      const raw = Array.isArray(data) ? data : data.refunds || [];
      // Map booking rows (snake_case) to the refund shape used by the UI
      setRefunds(raw.map((r: any) => ({
        id: r.id,
        bookingId: r.id,
        amount: r.refund_amount || 0,
        reason: r.cancellation_reason || 'Not specified',
        status: r.refund_status || 'pending',
        createdAt: r.updated_at || r.created_at || new Date().toISOString(),
        user: { name: r.guest_name || 'Guest', email: '' },
        listing: { title: r.listing_title || 'N/A' },
      })));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleApprove = async (bookingId: string) => {
    try {
      await adminApi.processRefund(bookingId, 'approve');
      setRefunds(refunds.map(r => 
        r.bookingId === bookingId ? { ...r, status: 'approved' } : r
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve refund');
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!confirm('Reject this refund request?')) return;
    try {
      await adminApi.processRefund(bookingId, 'reject');
      setRefunds(refunds.map(r => 
        r.bookingId === bookingId ? { ...r, status: 'rejected' } : r
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject refund');
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    return statusFilter === 'all' || refund.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const totalPending = refunds.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalApproved = refunds.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0);

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
          <h1 className="text-2xl font-bold text-slate-900">Manage Refunds</h1>
          <p className="text-slate-500 mt-1">{refunds.length} total refund requests</p>
        </div>
        <button
          onClick={fetchRefunds}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Refunds</p>
              <p className="text-xl font-bold text-slate-900">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Approved Refunds</p>
              <p className="text-xl font-bold text-slate-900">₹{totalApproved.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Requests</p>
              <p className="text-xl font-bold text-slate-900">{refunds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
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

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.map((refund) => (
          <div key={refund.id} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">Booking: {refund.bookingId}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(refund.status)}`}>
                    {refund.status?.charAt(0).toUpperCase() + refund.status?.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Guest: {refund.user?.name || 'N/A'} • {refund.listing?.title || 'N/A'}
                </p>
                <p className="text-sm text-slate-500 mt-1">Reason: {refund.reason}</p>
                <p className="text-sm text-slate-400 mt-1">
                  Requested: {new Date(refund.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">₹{(refund.amount || 0).toLocaleString()}</p>
                {refund.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(refund.bookingId)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(refund.bookingId)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredRefunds.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No refund requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
