import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  verificationStatus: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function ManageVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getVendors();
      const raw = Array.isArray(data) ? data : data.vendors || [];
      setVendors(raw.map((v: any) => ({
        id: v.id,
        userId: v.user_id || v.userId,
        businessName: v.business_name || v.businessName || 'Unnamed',
        verificationStatus: v.verification_status || v.verificationStatus || 'pending',
        createdAt: v.created_at || v.createdAt || new Date().toISOString(),
        user: {
          name: v.owner_name || v.user?.name || 'N/A',
          email: v.owner_email || v.user?.email || 'N/A',
        },
      })));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApprove = async (vendorId: string) => {
    try {
      await adminApi.approveVendor(vendorId);
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, verificationStatus: 'verified' } : v
      ));
    } catch (err: any) {
      alert('Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await adminApi.rejectVendor(vendorId, reason);
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, verificationStatus: 'rejected' } : v
      ));
    } catch (err: any) {
      alert('Failed to reject vendor');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
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
          <h1 className="text-2xl font-bold text-slate-900">Manage Vendors</h1>
          <p className="text-slate-500 mt-1">{vendors.length} total vendors</p>
        </div>
        <button
          onClick={fetchVendors}
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
            placeholder="Search vendors..."
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
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{vendor.businessName}</h3>
                  <p className="text-sm text-slate-500">{vendor.user?.email}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(vendor.verificationStatus)}`}>
                {vendor.verificationStatus?.charAt(0).toUpperCase() + vendor.verificationStatus?.slice(1)}
              </span>
            </div>

            <div className="text-sm text-slate-600 mb-4">
              <p>Owner: {vendor.user?.name}</p>
              <p className="mt-1">Joined: {new Date(vendor.createdAt).toLocaleDateString('en-IN')}</p>
            </div>

            {vendor.verificationStatus === 'pending' && (
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleApprove(vendor.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(vendor.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No vendors found</p>
        </div>
      )}
    </div>
  );
}
