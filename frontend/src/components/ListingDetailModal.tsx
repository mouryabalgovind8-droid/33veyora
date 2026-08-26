import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Users,
  ShieldCheck,
  Calendar as CalendarIcon,
  Check,
  MessageSquare,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { Currency, Listing, Review } from '../types';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  currency: Currency;
  onProceedToBooking: (
    listing: Listing,
    checkIn: string,
    checkOut: string,
    guests: number,
    totalPriceINR: number,
    totalPriceUSD: number
  ) => void;
  onOpenChatWithHost: (hostName: string, listingTitle: string) => void;
  reviews: Review[];
  onSubmitReview: (listingId: string, rating: number, comment: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  currency,
  onProceedToBooking,
  onOpenChatWithHost,
  reviews,
  onSubmitReview,
}) => {
  if (!listing) return null;

  // Real-time Availability Calendar state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow);
  const [guestsCount, setGuestsCount] = useState(2);
  const [activeImg, setActiveImg] = useState(listing.images[0]);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Price calculations
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nightsCount = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

  const isPerPerson = listing.price.unit === 'person' || listing.price.unit === 'session';
  const multiplier = isPerPerson ? guestsCount : nightsCount;

  const basePriceINR = listing.price.amountINR * multiplier;
  const basePriceUSD = listing.price.amountUSD * multiplier;
  const cleaningFeeINR = 800;
  const serviceTaxINR = Math.round(basePriceINR * 0.08);
  const totalPriceINR = basePriceINR + cleaningFeeINR + serviceTaxINR;

  const cleaningFeeUSD = 10;
  const serviceTaxUSD = Math.round(basePriceUSD * 0.08);
  const totalPriceUSD = basePriceUSD + cleaningFeeUSD + serviceTaxUSD;

  const displayBase =
    currency === 'INR' ? `₹${basePriceINR.toLocaleString()}` : `$${basePriceUSD}`;
  const displayTotal =
    currency === 'INR' ? `₹${totalPriceINR.toLocaleString()}` : `$${totalPriceUSD}`;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onSubmitReview(listing.id, newRating, newComment);
    setNewComment('');
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-800">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-white/95 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-full uppercase">
              {listing.category}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              {listing.location.city}, {listing.location.state}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Gallery Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={activeImg} alt={listing.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
              {listing.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    activeImg === img ? 'border-indigo-600 scale-[0.98]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Title & Host Brief */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6 border-b border-slate-200">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{listing.title}</h1>
                <p className="text-sm text-slate-600 leading-relaxed">{listing.tagline}</p>
              </div>

              {/* Host Badge Bar */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <img
                  src={listing.host.avatar}
                  alt={listing.host.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">Hosted by {listing.host.name}</h4>
                    {listing.host.superhost && (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-sm">
                        <ShieldCheck className="h-3 w-3" />
                        Superhost
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Member since {listing.host.joinedYear} &bull; Response rate: {listing.host.responseRate}
                  </p>
                </div>
                <button
                  onClick={() => onOpenChatWithHost(listing.host.name, listing.title)}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Message Host</span>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">About this Experience</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Amenities Grid */}
              <div className="space-y-3 pt-4">
                <h3 className="text-base font-bold text-slate-900">Included Amenities &amp; Services</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {listing.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                    >
                      <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* REAL-TIME AVAILABILITY CALENDAR & BOOKING ENGINE CARD */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-xl space-y-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-white">
                      {currency === 'INR'
                        ? `₹${listing.price.amountINR.toLocaleString()}`
                        : `$${listing.price.amountUSD}`}
                    </span>
                    <span className="text-xs text-slate-400"> / {listing.price.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>{listing.rating.toFixed(2)}</span>
                  </div>
                </div>

                {/* Real-time Availability Picker */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4" />
                      Real-Time Availability Calendar
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Live Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Check-In / Date
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Check-Out
                      </label>
                      <input
                        type="date"
                        min={checkIn}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                      Guests Count
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>
                      {currency === 'INR'
                        ? `₹${listing.price.amountINR.toLocaleString()}`
                        : `$${listing.price.amountUSD}`}{' '}
                      x {multiplier} {isPerPerson ? 'guest(s)' : 'night(s)'}
                    </span>
                    <span className="font-semibold">{displayBase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning &amp; Gear Maintenance</span>
                    <span>{currency === 'INR' ? '₹800' : '$10'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee &amp; Platform Insurance</span>
                    <span>{currency === 'INR' ? `₹${serviceTaxINR}` : `$${serviceTaxUSD}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                    <span>Total ({currency})</span>
                    <span className="text-indigo-400">{displayTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() =>
                    onProceedToBooking(
                      listing,
                      checkIn,
                      checkOut,
                      guestsCount,
                      totalPriceINR,
                      totalPriceUSD
                    )
                  }
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Reserve &amp; Pay via Razorpay / PayPal</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <Info className="h-3 w-3 text-indigo-400" />
                  You won't be charged until payment step is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* REVIEWS & SUB-RATINGS SECTION */}
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span>{listing.rating.toFixed(2)} &bull; {listing.reviewCount} Guest Reviews</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Verified ratings from guests who completed bookings.
                </p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-indigo-700 transition-all self-start"
              >
                {showReviewForm ? 'Cancel' : '+ Write a Review'}
              </button>
            </div>

            {/* Sub-ratings Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Cleanliness</span>
                <p className="font-bold text-slate-900 text-sm">{listing.subRatings.cleanliness} / 5</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Accuracy</span>
                <p className="font-bold text-slate-900 text-sm">{listing.subRatings.accuracy} / 5</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Communication</span>
                <p className="font-bold text-slate-900 text-sm">{listing.subRatings.communication} / 5</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Location</span>
                <p className="font-bold text-slate-900 text-sm">{listing.subRatings.location} / 5</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Value</span>
                <p className="font-bold text-slate-900 text-sm">{listing.subRatings.value} / 5</p>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 border border-indigo-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Write Your Experience Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-semibold">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`h-5 w-5 cursor-pointer transition-transform ${
                        star <= newRating ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details about your stay, activities, host hospitality, or recommendations..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Submit Verified Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.authorAvatar}
                        alt={rev.authorName}
                        className="h-9 w-9 rounded-full object-cover border border-indigo-600"
                      />
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{rev.authorName}</h5>
                        <p className="text-[10px] text-slate-400">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                  {rev.hostResponse && (
                    <div className="mt-2 p-3 bg-white border-l-2 border-indigo-600 rounded-r-xl text-xs text-slate-700 shadow-sm">
                      <span className="font-bold text-indigo-600 block mb-0.5">Response from Host {listing.host.name}:</span>
                      {rev.hostResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
