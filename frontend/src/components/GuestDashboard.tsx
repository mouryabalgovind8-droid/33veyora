import React from 'react';
import { CheckCircle2, Calendar, MapPin, Download, MessageSquare, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Booking, Currency } from '../types';

interface GuestDashboardProps {
  bookings: Booking[];
  currency: Currency;
  onOpenChat: (hostName: string, title: string) => void;
  onExploreMore: () => void;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({
  bookings,
  currency,
  onOpenChat,
  onExploreMore,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-full uppercase">
            Guest Account
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Trips, Stays &amp; Activity Bookings</h1>
        <p className="text-xs text-slate-500">
          Access active reservation vouchers, view check-in guides, message host securely, and download verified payment receipts.
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <Calendar className="h-12 w-12 text-indigo-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Upcoming Trips Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready for an adventure or peaceful holiday homestay? Browse holiday stays, workshops, and outdoor events now!
          </p>
          <button
            onClick={onExploreMore}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            <span>Explore Experiences</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-slate-100">
                  <img
                    src={booking.listingImage}
                    alt={booking.listingTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />

                  <div className="absolute top-3 left-3 bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Booking Confirmed</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 font-mono text-[10px] px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                    ID: {booking.id}
                  </div>
                </div>

                {/* Info Details */}
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{booking.listingTitle}</h3>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Check-In / Date</span>
                      <span className="font-bold text-slate-900">{booking.checkInDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Check-Out</span>
                      <span className="font-bold text-slate-900">{booking.checkOutDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Guests</span>
                      <span className="font-bold text-slate-900">{booking.guestsCount} Guest(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Paid</span>
                      <span className="font-bold text-indigo-600">
                        {booking.paidCurrency === 'INR'
                          ? `₹${booking.totalAmountINR.toLocaleString()}`
                          : `$${booking.totalAmountUSD}`}
                      </span>
                    </div>
                  </div>

                  {/* Host Section */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={booking.hostAvatar}
                        alt={booking.hostName}
                        className="h-8 w-8 rounded-full object-cover border border-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{booking.hostName}</span>
                        <span className="text-[10px] text-slate-500">Host Contact Verified</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenChat(booking.hostName, booking.listingTitle)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Download Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">Gateway: {booking.paymentGateway} ({booking.paymentId})</span>
                <button
                  onClick={() => alert(`Receipt downloaded for ${booking.id}! Voucher PDF ready.`)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Download Voucher</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
