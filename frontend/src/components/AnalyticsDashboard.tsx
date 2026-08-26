import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  DollarSign,
  Users,
  Calendar,
  Download,
  ShieldCheck,
  Percent,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { AnalyticsSummary, Currency } from '../types';

interface AnalyticsDashboardProps {
  currency: Currency;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ currency }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        if (json.analytics) {
          setData(json.analytics);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const COLORS = ['#4f46e5', '#2563eb', '#0284c7', '#0d9488'];

  const exportCSV = () => {
    if (!data) return;
    const csvRows = [
      ['Month', 'Revenue (INR)', 'Bookings Count'],
      ...data.monthlyRevenue.map((m) => [m.month, m.revenueINR, m.bookingsCount]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '33veyora_Host_Revenue_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium">Loading Advanced Analytics Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-full uppercase">
              Host Performance Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Advanced Analytics &amp; Revenue Trends</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on revenue growth, occupancy percentages, category yields, and seasonality.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 self-start shadow-sm transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Export Report (CSV)</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Total Platform Revenue</span>
          <p className="text-2xl font-black text-indigo-600">
            {currency === 'INR'
              ? `₹${data.totalRevenueINR.toLocaleString()}`
              : `$${data.totalRevenueUSD}`}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +18.4% vs last month
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Occupancy Rate</span>
          <p className="text-2xl font-black text-slate-900">{data.occupancyRate}%</p>
          <span className="text-[10px] text-slate-500">Peak high-season momentum</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Total Completed Bookings</span>
          <p className="text-2xl font-black text-slate-900">{data.totalBookings}</p>
          <span className="text-[10px] text-slate-500">Verified guests</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Average Guest Rating</span>
          <p className="text-2xl font-black text-amber-500">{data.averageRating} ★</p>
          <span className="text-[10px] text-slate-500">Superhost standard</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>Monthly Revenue Growth Trend (₹ INR)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="revenueINR" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-indigo-600" />
            <span>Revenue by Experience Category</span>
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amountINR"
                  nameKey="category"
                >
                  {data.categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
