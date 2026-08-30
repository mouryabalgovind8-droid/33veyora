import { useState, useEffect } from 'react';
import {
  Percent, Save, AlertCircle, Info, TrendingUp, DollarSign, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface CommissionConfig {
  category: string;
  percentage: number;
  isActive: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  homestay: 'Homestays', hotel: 'Hotels', resort: 'Resorts', villa: 'Villas',
  apartment: 'Apartments', guesthouse: 'Guest Houses', cottage: 'Cottages',
  hostel: 'Hostels', private_room: 'Private Rooms', camp: 'Camps',
  luxury: 'Luxury Stays', adventure: 'Adventures', workshop: 'Workshops', event: 'Events',
};

export default function ManageCommissionPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(10);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commissionData, statsData] = await Promise.all([
        adminApi.getCommissions(),
        adminApi.getStats().catch(() => null),
      ]);
      const raw = commissionData?.commissions || [];
      setConfigs(raw.map((c: any) => ({
        category: c.category,
        percentage: c.percentage,
        isActive: c.is_active ?? true,
      })));
      const categoryStats = statsData?.categoryStats || [];
      setTotalRevenue(categoryStats.reduce((sum: number, s: any) => sum + Number(s.revenue || 0), 0));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (category: string) => {
    if (editValue < 0 || editValue > 100) {
      alert('Commission must be between 0 and 100');
      return;
    }
    try {
      setSaving(true);
      await adminApi.updateCommission(category, editValue);
      setConfigs(configs.map(c =>
        c.category === category ? { ...c, percentage: editValue } : c
      ));
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update commission');
    } finally {
      setSaving(false);
    }
  };

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
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission Settings</h1>
          <p className="text-slate-500 mt-1">Platform commission rate per category</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue (confirmed bookings)</p>
              <p className="text-xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Categories configured</p>
              <p className="text-xl font-bold text-slate-900">{configs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Commission is deducted from each confirmed booking in that category. Changes apply to
          future bookings immediately.
        </p>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Commission %</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Status</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {configs.map((config) => {
              const isEditing = editingCategory === config.category;
              return (
                <tr key={config.category} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {CATEGORY_LABELS[config.category] || config.category}
                    <span className="text-xs text-slate-400 ml-2">({config.category})</span>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                          min="0"
                          max="100"
                        />
                        <Percent className="h-4 w-4 text-slate-400" />
                      </div>
                    ) : (
                      <span className="text-slate-900 font-semibold">{config.percentage}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      config.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(config.category)}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setEditingCategory(config.category); setEditValue(config.percentage); }}
                          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Example Calculation */}
      <div className="mt-8 bg-slate-50 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Example Calculation</h3>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-500 mb-1">Guest Pays</p>
              <p className="text-xl font-bold text-slate-900">₹10,000</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Platform Commission (10%)</p>
              <p className="text-xl font-bold text-red-600">-₹1,000</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Vendor Receives</p>
              <p className="text-xl font-bold text-green-600">₹9,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
