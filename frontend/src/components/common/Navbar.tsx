import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Heart, LogOut, Compass, Menu, X, Plus, KeyRound } from 'lucide-react';
import { StaysIcon, AdventuresIcon, WorkshopsIcon, EventsIcon } from './IllustratedIcons';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">33v</span>
              <span className="hidden md:block text-sm font-medium text-slate-500">
                33veyora
              </span>
            </Link>
          </div>
          
          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/search?category=homestay" 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              Stays
            </Link>
            <Link 
              to="/search?category=adventure" 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              Adventures
            </Link>
            <Link 
              to="/search?category=workshop" 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              Workshops
            </Link>
            <Link 
              to="/search?category=event" 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              Events
            </Link>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search icon - mobile */}
            <Link 
              to="/search" 
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              <Search className="h-5 w-5" />
            </Link>
            
            {/* Vendor quick upload — direct access from the top bar */}
            {user?.role === 'vendor' && (
              <>
                <Link 
                  to="/vendor/add-listing" 
                  className="hidden sm:flex items-center gap-1 px-3.5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Listing
                </Link>
                <Link 
                  to="/vendor/add-listing?category=event" 
                  className="hidden sm:flex items-center gap-1 px-3.5 py-2 text-sm font-semibold bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Event
                </Link>
              </>
            )}
            
            {/* Become a Host — only for guests (logged-in users don't see vendor items) */}
            {!user && (
              <Link 
                to="/register?role=vendor" 
                className="hidden sm:flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
              >
                <StaysIcon className="w-4 h-4" />
                Host
              </Link>
            )}
            
            {/* Wishlist */}
            {user && user.role === 'user' && (
              <Link 
                to="/wishlist" 
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}
            
            {/* Notifications */}
            {user && <NotificationBell />}
            
            {/* Profile / Auth */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {user.role === 'vendor' && (
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        <KeyRound className="h-3 w-3" />
                        Host
                      </span>
                    </div>
                  )}
                  {user.role === 'admin' && (
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-200">Admin</span>
                    </div>
                  )}
                  
                  {user.role === 'user' ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Profile
                      </Link>
                      <Link to="/my-bookings" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        My Bookings
                      </Link>
                      <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Wishlist
                      </Link>
                    </>
                  ) : user.role === 'vendor' ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Profile
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <Link to="/vendor" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Dashboard
                      </Link>
                      <Link to="/vendor/listings" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        My Listings
                      </Link>
                      <Link to="/vendor/bookings" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Bookings
                      </Link>
                      <Link to="/vendor/earnings" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Earnings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Profile
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <Link to="/admin" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/users" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Manage Users
                      </Link>
                      <Link to="/admin/vendors" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Manage Vendors
                      </Link>
                      <Link to="/admin/listings" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Manage Listings
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4">
            <div className="flex flex-col gap-1">
              <Link 
                to="/search?category=homestay" 
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Stays
              </Link>
              <Link 
                to="/search?category=adventure" 
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Adventures
              </Link>
              <Link 
                to="/search?category=workshop" 
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link 
                to="/search?category=event" 
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              {user?.role === 'vendor' && (
                <>
                  <div className="border-t border-slate-100 my-2"></div>
                  <Link 
                    to="/vendor/add-listing" 
                    className="px-4 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + Upload Listing
                  </Link>
                  <Link 
                    to="/vendor/add-listing?category=event" 
                    className="px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + Upload Event
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <div className="border-t border-slate-100 my-2"></div>
                  <Link 
                    to="/register?role=vendor" 
                    className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become a Host
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
