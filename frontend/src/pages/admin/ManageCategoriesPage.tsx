import { useState, useEffect } from 'react';
import {
  Home, Mountain, Palette, Calendar, RefreshCw,
  Package, CheckCircle, Info
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface CategoryInfo {
  category: string;
  listingCount: number;
  approvedCount: number;
  commissionPercentage: number;
}

// Display metadata for the system categories (defined by the DB constraint)
const CATEGORY_META: Record<string, { name: string; description: string; icon: any; color: string }> = {
  homestay: { name: 'Homestays', description: 'Local homes with a personal touch', icon: Home, color: 'bg-indigo-100 text-indigo-600' },
  hotel: { name: 'Hotels', description: 'Hotels & serviced stays', icon: Home, color: 'bg-blue-100 text-blue-600' },
  resort: { name: 'Resorts', description: 'Resorts & holiday properties', icon: Home, color: 'bg-teal-100 text-teal-600' },
  villa: { name: 'Villas', description: 'Private villas & pool homes', icon: Home, color: 'bg-amber-100 text-amber-600' },
  apartment: { name: 'Apartments', description: 'City apartments & condos', icon: Home, color: 'bg-cyan-100 text-cyan-600' },
  guesthouse: { name: 'Guest Houses', description: 'Guest houses & B&Bs', icon: Home, color: 'bg-lime-100 text-lime-600' },
  cottage: { name: 'Cottages', description: 'Cosy cottages & cabins', icon: Home, color: 'bg-green-100 text-green-600' },
  hostel: { name: 'Hostels', description: 'Budget hostels & dorms', icon: Home, color: 'bg-purple-100 text-purple-600' },
  private_room: { name: 'Private Rooms', description: 'Rooms in shared homes', icon: Home, color: 'bg-pink-100 text-pink-600' },
  camp: { name: 'Camps', description: 'Camps & nature stays', icon: Mountain, color: 'bg-lime-100 text-lime-700' },
  luxury: { name: 'Luxury Stays', description: 'Premium & luxury properties', icon: Home, color: 'bg-yellow-100 text-yellow-700' },
  adventure: { name: 'Adventures', description: 'Trekking, rafting & outdoor fun', icon: Mountain, color: 'bg-orange-100 text-orange-600' },
  workshop: { name: 'Workshops', description: 'Cooking, art & craft classes', icon: Palette, color: 'bg-emerald-100 text-emerald-600' },
  event: { name: 'Events', description: 'Events, festivals & experiences', icon: Calendar, color: 'bg-rose-100 text-rose-600' },
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data?.categories || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={fetchCategories} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
          <p className="text-slate-500 mt-1">Platform sections vendors can list under</p>
        </div>
        <button
          onClick={fetchCategories}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          These are system categories — they are managed at the database level to keep listings
          consistent. Use the <span className="font-semibold">Commission Settings</span> page to change
          the platform fee per category.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat.category] || { name: cat.category, description: '', icon: Package, color: 'bg-slate-100 text-slate-600' };
          const Icon = meta.icon;
          return (
            <div key={cat.category} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{meta.name}</h3>
                    <p className="text-xs text-slate-500">{meta.description}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
                <div>
                  <p className="text-lg font-bold text-slate-900">{cat.listingCount}</p>
                  <p className="text-[11px] text-slate-500">Total listings</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{cat.approvedCount}</p>
                  <p className="text-[11px] text-slate-500">Live</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-600">{cat.commissionPercentage}%</p>
                  <p className="text-[11px] text-slate-500">Commission</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No categories found</p>
        </div>
      )}
    </div>
  );
}
