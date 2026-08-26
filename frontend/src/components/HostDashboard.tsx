import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Building,
  User,
  Search,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Booking, CategoryType, Currency, Listing } from '../types';

interface HostDashboardProps {
  bookings: Booking[];
  currency: Currency;
  onOpenChat: (hostName: string, title: string) => void;
  onAddNewListing: () => void;
  listings: Listing[];
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  bookings,
  currency,
  onOpenChat,
  onAddNewListing,
  listings,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.bookingStatus === filterStatus;
    const matchesQuery =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const totalEarningsINR = bookings
    .filter((b) => b.bookingStatus === 'confirmed')
    .reduce((sum, b) => sum + Math.round(b.totalAmountINR * 0.9), 0);

  const totalEarningsUSD = bookings
    .filter((b) => b.bookingStatus === 'confirmed')
    .reduce((sum, b) => sum + Math.round(b.totalAmountUSD * 0.9), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-full uppercase">
                Host Command Center
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Host Reservation &amp; Inventory Hub</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage incoming stay reservations, activity slots, automated payouts, and guest check-in preparation.
            </p>
          </div>

          <button
            onClick={onAddNewListing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 self-start"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Experience / Stay</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Confirmed Bookings</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{bookings.length}</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Host Payout</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {currency === 'INR' ? `₹${totalEarningsINR.toLocaleString()}` : `$${totalEarningsUSD}`}
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Active Listings</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{listings.length}</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Host Rating Score</span>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">4.96 ★</p>
          </div>
        </div>
      </div>

      {/* Reservation Management Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span>Manage Guest Reservations</span>
          </h2>

          {/* Filters & Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search guest or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="p-3">Booking ID</th>
                <th className="p-3">Experience / Stay</th>
                <th className="p-3">Guest Details</th>
                <th className="p-3">Check-In / Out</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No reservations found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600">{b.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={b.listingImage}
                          alt={b.listingTitle}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1 max-w-[180px]">
                          {b.listingTitle}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{b.guestName}</p>
                      <p className="text-[10px] text-slate-500">{b.guestEmail}</p>
                      <p className="text-[10px] text-slate-500">{b.guestPhone}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{b.checkInDate}</p>
                      <p className="text-[10px] text-slate-500">to {b.checkOutDate}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-indigo-600">
                        {b.paidCurrency === 'INR' ? `₹${b.totalAmountINR.toLocaleString()}` : `$${b.totalAmountUSD}`}
                      </p>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                        {b.paymentGateway}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : b.bookingStatus === 'completed'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenChat(b.hostName, b.listingTitle)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-all"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
