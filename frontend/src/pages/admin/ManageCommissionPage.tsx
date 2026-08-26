import { useState } from 'react';
import { 
  Percent, 
  Save, 
  AlertCircle, 
  Info,
  TrendingUp,
  DollarSign,
  Users,
  Package
} from 'lucide-react';

interface CommissionConfig {
  id: string;
  category: string;
  commissionRate: number;
  minBookingAmount: number;
  maxCommission: number;
  isActive: boolean;
}

const defaultConfigs: CommissionConfig[] = [
  { id: '1', category: 'Stays', commissionRate: 12, minBookingAmount: 1000, maxCommission: 50000, isActive: true },
  { id: '2', category: 'Adventures', commissionRate: 15, minBookingAmount: 500, maxCommission: 30000, isActive: true },
  { id: '3', category: 'Workshops', commissionRate: 10, minBookingAmount: 200, maxCommission: 10000, isActive: true },
  { id: '4', category: 'Events', commissionRate: 10, minBookingAmount: 100, maxCommission: 15000, isActive: true },
  { id: '5', category: 'Default', commissionRate: 12, minBookingAmount: 500, maxCommission: 25000, isActive: true },
];

export default function ManageCommissionPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>(defaultConfigs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleEdit = (config: CommissionConfig) => {
    setEditingId(config.id);
  };
  
  const handleChange = (id: string, field: keyof CommissionConfig, value: number) => {
    setConfigs(configs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ));
    setHasChanges(true);
  };
  
  const handleSave = () => {
    // In production, this would call an API
    console.log('Saving commission configs:', configs);
    setHasChanges(false);
    setEditingId(null);
    alert('Commission settings saved successfully!');
  };
  
  const totalRevenue = 1250000;
  const totalCommission = 156000;
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission Settings</h1>
          <p className="text-slate-500 mt-1">Configure platform commission rates for each category</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          Save Changes
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-xl font-bold text-slate-900">₹{(totalRevenue).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Commission Earned</p>
              <p className="text-xl font-bold text-slate-900">₹{(totalCommission).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Commission Rate</p>
              <p className="text-xl font-bold text-slate-900">12.5%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>How commissions work:</strong> The platform commission is deducted from the vendor's earnings when a booking is completed. 
              For example, if a guest pays ₹10,000 and the commission is 12%, the vendor receives ₹8,800.
            </p>
          </div>
        </div>
      </div>
      
      {/* Commission Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Commission Rate (%)</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Min. Booking (₹)</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Max Commission (₹)</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Status</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {configs.map((config) => {
              const isEditing = editingId === config.id;
              
              return (
                <tr key={config.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{config.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={config.commissionRate}
                          onChange={(e) => handleChange(config.id, 'commissionRate', Number(e.target.value))}
                          className="w-24 px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                          min="0"
                          max="50"
                          step="0.5"
                        />
                        <Percent className="h-4 w-4 text-slate-400" />
                      </div>
                    ) : (
                      <span className="text-slate-900">{config.commissionRate}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={config.minBookingAmount}
                        onChange={(e) => handleChange(config.id, 'minBookingAmount', Number(e.target.value))}
                        className="w-32 px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                        min="0"
                      />
                    ) : (
                      <span className="text-slate-600">₹{config.minBookingAmount.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={config.maxCommission}
                        onChange={(e) => handleChange(config.id, 'maxCommission', Number(e.target.value))}
                        className="w-32 px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                        min="0"
                      />
                    ) : (
                      <span className="text-slate-600">₹{config.maxCommission.toLocaleString()}</span>
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
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => isEditing ? setEditingId(null) : handleEdit(config)}
                        className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
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
              <p className="text-sm text-slate-500 mb-1">Platform Commission (12%)</p>
              <p className="text-xl font-bold text-red-600">-₹1,200</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Vendor Receives</p>
              <p className="text-xl font-bold text-green-600">₹8,800</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
