import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openTripPlanner: () => void;
  selectedCategory: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  openTripPlanner,
}) => {
  const navigate = useNavigate();

  const handleHeroSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 py-12 md:py-16 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Holiday Stays &bull; Events &bull; Outdoor Adventures &bull; Workshops</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Unforgettable Holiday Homestays &amp; Handcrafted Experiences
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Book glass chalets, white-water river rafting, ceramics workshops, and sunset wine dinners with real-time availability calendar &amp; secure Razorpay / PayPal checkout.
        </p>

        {/* Hero Search Box */}
        <div className="max-w-3xl mx-auto bg-white/10 border border-white/20 p-2 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-900/60 rounded-xl w-full border border-slate-700/60">
            <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Where to? (e.g. Manali, Goa, Rishikesh, Coorg...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleHeroSearch}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>

          <button
            onClick={openTripPlanner}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Itinerary Planner</span>
          </button>
        </div>

        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 pt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            Razorpay &amp; PayPal Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Real-Time Live Calendar Sync
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-indigo-400" />
            Direct E2E Host Messaging
          </span>
        </div>
      </div>
    </div>
  );
};
