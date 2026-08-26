import React from 'react';
import {
  Compass,
  Home,
  PlusCircle,
  Bell,
  MessageSquare,
  BarChart3,
  Sparkles,
  User,
  ShieldCheck,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Currency } from '../types';

interface NavbarProps {
  currentRole: 'guest' | 'host';
  setCurrentRole: (role: 'guest' | 'host') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  activeTab: 'explore' | 'guest_dashboard' | 'host_dashboard' | 'analytics' | 'emails';
  setActiveTab: (tab: 'explore' | 'guest_dashboard' | 'host_dashboard' | 'analytics' | 'emails') => void;
  unreadNotificationsCount: number;
  openTripPlanner: () => void;
  openCreateListing: () => void;
  openChat: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  currency,
  setCurrency,
  activeTab,
  setActiveTab,
  unreadNotificationsCount,
  openTripPlanner,
  openCreateListing,
  openChat,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                BlOOM &amp; OYO
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                <span>Stays &bull; Adventures &bull; Workshops</span>
              </div>
            </div>
          </div>

          {/* Search bar in middle */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search villas, rafting, pottery workshops, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Availability Badge */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live Availability</span>
            </div>

            {/* AI Trip Planner button */}
            <button
              onClick={openTripPlanner}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>AI Itinerary</span>
            </button>

            {/* Currency selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-1 rounded-md transition-all ${
                  currency === 'INR'
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Email Notification Logs button */}
            <button
              onClick={() => setActiveTab('emails')}
              className={`relative p-2 rounded-xl border transition-all ${
                activeTab === 'emails'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Automated Email Notification Logs"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Encrypted Chat Button */}
            <button
              onClick={openChat}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all relative"
              title="Encrypted Host & Guest Chat"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            </button>

            {/* Host Analytics */}
            {currentRole === 'host' && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setCurrentRole('guest');
                  if (activeTab === 'host_dashboard' || activeTab === 'analytics') {
                    setActiveTab('explore');
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'guest'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Guest</span>
              </button>
              <button
                onClick={() => {
                  setCurrentRole('host');
                  setActiveTab('host_dashboard');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'host'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Host</span>
              </button>
            </div>

            {/* Host "Add Experience" button */}
            {currentRole === 'host' && (
              <button
                onClick={openCreateListing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Add Listing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="bg-white/80 border-t border-slate-100 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 font-semibold transition-all pb-1 ${
              activeTab === 'explore'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Explore Experiences</span>
          </button>

          {currentRole === 'guest' && (
            <button
              onClick={() => setActiveTab('guest_dashboard')}
              className={`flex items-center gap-1.5 font-semibold transition-all pb-1 ${
                activeTab === 'guest_dashboard'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>My Trips &amp; Bookings</span>
            </button>
          )}

          {currentRole === 'host' && (
            <button
              onClick={() => setActiveTab('host_dashboard')}
              className={`flex items-center gap-1.5 font-semibold transition-all pb-1 ${
                activeTab === 'host_dashboard'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Host Reservation Hub</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('emails')}
            className={`flex items-center gap-1.5 font-semibold transition-all pb-1 ${
              activeTab === 'emails'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Automated Email Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
