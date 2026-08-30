import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, CheckCircle, MapPin, CalendarClock, Users, Ticket, Loader2, LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking.api';
import { EventListing, formatEventDate } from './EventCard';

interface EventPreBookModalProps {
  event: EventListing | null;
  onClose: () => void;
}

/**
 * Pre-booking modal for events — lets normal users reserve a spot before
 * the event starts. Guests must log in first; vendors/admins are not
 * allowed to pre-book (role permissions).
 */
export default function EventPreBookModal({ event, onClose }: EventPreBookModalProps) {
  const { user } = useAuth();
  const [guests, setGuests] = useState(1);
  const [requests, setRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookedId, setBookedId] = useState<string | null>(null);

  if (!event) return null;

  const maxGuests = event.max_participants ? Math.min(event.max_participants, 50) : 20;
  const total = (event.price_inr || 0) * guests;

  const handlePreBook = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await bookingApi.create({
        listingId: event.id,
        checkInDate: event.event_start!,
        checkOutDate: event.event_end!,
        guestsCount: guests,
        specialRequests: requests || undefined,
        paymentGateway: 'Razorpay',
        paidCurrency: 'INR',
      });
      setBookedId(res?.booking?.id || 'BK');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to pre-book. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {bookedId ? (
          /* ---------- SUCCESS ---------- */
          <div className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Spot reserved! 🎉</h2>
            <p className="text-slate-500 mb-1">
              Pre-booking <span className="font-semibold text-slate-700">{bookedId}</span> confirmed for
            </p>
            <p className="font-semibold text-slate-800 mb-4">{event.title}</p>
            <p className="text-sm text-slate-500 mb-6">
              The host has been notified and will confirm your booking shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/my-bookings"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                View My Bookings
              </Link>
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : !user ? (
          /* ---------- NOT LOGGED IN ---------- */
          <div className="p-8 text-center">
            <LogIn className="h-14 w-14 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Login to pre-book</h2>
            <p className="text-slate-500 mb-6">
              Create a free guest account to reserve your spot at this event.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                onClick={onClose}
                className="px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        ) : user.role !== 'user' ? (
          /* ---------- WRONG ROLE ---------- */
          <div className="p-8 text-center">
            <Ticket className="h-14 w-14 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Guests only</h2>
            <p className="text-slate-500">Pre-booking is available for guest (user) accounts only.</p>
          </div>
        ) : (
          /* ---------- PRE-BOOK FORM ---------- */
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-rose-500" /> Pre-Book Event
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Reserve your spot before it starts — the host confirms your booking.
            </p>

            {/* Event summary */}
            <div className="flex gap-3 p-3 bg-rose-50/70 border border-rose-100 rounded-2xl mb-5">
              {event.images?.[0] && (
                <img src={event.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover" />
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {event.location_city}
                  {event.location_state ? `, ${event.location_state}` : ''}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <CalendarClock className="h-3 w-3" /> {formatEventDate(event.event_start)}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Participants</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  −
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-slate-900 w-6 text-center">{guests}</span>
                </div>
                <button
                  onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  +
                </button>
                {event.max_participants ? (
                  <span className="text-xs text-slate-400">Max {event.max_participants}</span>
                ) : null}
              </div>
            </div>

            {/* Special requests */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Special requests (optional)
              </label>
              <textarea
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                rows={2}
                placeholder="Anything the host should know..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
            </div>

            {/* Price summary */}
            <div className="p-4 bg-slate-50 rounded-2xl mb-5 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">
                  ₹{(event.price_inr || 0).toLocaleString()} × {guests} participant
                  {guests > 1 ? 's' : ''}
                </span>
                <span className="font-medium text-slate-900">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-slate-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={handlePreBook}
              disabled={submitting}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ticket className="h-5 w-5" />}
              {submitting ? 'Reserving...' : `Pre-Book for ₹${total.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}