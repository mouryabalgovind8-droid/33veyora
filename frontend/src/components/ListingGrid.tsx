import React, { useState } from 'react';
import { Star, MapPin, Users, ShieldCheck, CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Currency, Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  currency: Currency;
  onSelectListing: (listing: Listing) => void;
  onQuickBook: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  currency,
  onSelectListing,
  onQuickBook,
}) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const displayPrice =
    currency === 'INR'
      ? `₹${listing.price.amountINR.toLocaleString()}`
      : `$${listing.price.amountUSD}`;

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % listing.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  const categoryBadgeColors: Record<string, string> = {
    hotel: 'bg-blue-100 text-blue-700 border-blue-200',
    resort: 'bg-teal-100 text-teal-700 border-teal-200',
    villa: 'bg-amber-100 text-amber-800 border-amber-200',
    homestay: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    hostel: 'bg-purple-100 text-purple-700 border-purple-200',
    camp: 'bg-lime-100 text-lime-700 border-lime-200',
    adventure: 'bg-orange-100 text-orange-800 border-orange-200',
    workshop: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    event: 'bg-rose-100 text-rose-800 border-rose-200',
    all: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      onClick={() => onSelectListing(listing)}
      className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-sm"
    >
      <div>
        {/* Image Carousel Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
          <img
            src={listing.images[currentImgIdx]}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          {/* Carousel Arrows */}
          {listing.images.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={prevImg}
                className="p-1.5 rounded-full bg-white/80 text-slate-800 hover:bg-white backdrop-blur-sm border border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImg}
                className="p-1.5 rounded-full bg-white/80 text-slate-800 hover:bg-white backdrop-blur-sm border border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Category Pill Top Left */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${
                categoryBadgeColors[listing.category]
              }`}
            >
              {listing.category}
            </span>
            {listing.host.superhost && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                Superhost
              </span>
            )}
          </div>

          {/* Real-Time Availability Indicator Top Right */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Available</span>
          </div>

          {/* Image Dots Bottom Center */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1">
              {listing.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
              <span className="truncate font-medium text-slate-600">
                {listing.location.city}, {listing.location.state}
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.rating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal">({listing.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
            {listing.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {listing.tagline}
          </p>

          {/* Capacity and Key Features */}
          <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>Up to {listing.maxGuests} guests</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Booking CTA */}
      <div className="px-5 pb-5 pt-1 flex items-center justify-between border-t border-slate-100">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-slate-900">{displayPrice}</span>
            <span className="text-xs text-slate-500 font-normal">/ {listing.price.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400">Includes taxes &amp; fees</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickBook(listing);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

interface ListingGridProps {
  listings: Listing[];
  currency: Currency;
  onSelectListing: (listing: Listing) => void;
  onQuickBook: (listing: Listing) => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  currency,
  onSelectListing,
  onQuickBook,
}) => {
  if (listings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm my-8">
        <p className="text-slate-500 text-sm mb-2">No experiences found matching your filters.</p>
        <p className="text-slate-800 text-xs font-semibold">Try clearing your search terms or picking another category!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            currency={currency}
            onSelectListing={onSelectListing}
            onQuickBook={onQuickBook}
          />
        ))}
      </div>
    </div>
  );
};
