import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">33v</span>
              <span className="text-sm text-slate-400">33veyora</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Discover unique stays, adventures, and experiences across India.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
          
          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  All listings
                </Link>
              </li>
              <li>
                <Link to="/search?category=hotel" className="hover:text-white transition-colors">
                  Hotels
                </Link>
              </li>
              <li>
                <Link to="/search?category=resort" className="hover:text-white transition-colors">
                  Resorts
                </Link>
              </li>
              <li>
                <Link to="/search?category=villa" className="hover:text-white transition-colors">
                  Villas
                </Link>
              </li>
              <li>
                <Link to="/search?category=homestay" className="hover:text-white transition-colors">
                  Homestays
                </Link>
              </li>
              <li>
                <Link to="/search?category=hostel" className="hover:text-white transition-colors">
                  Hostels
                </Link>
              </li>
              <li>
                <Link to="/search?category=camp" className="hover:text-white transition-colors">
                  Camps
                </Link>
              </li>
              <li>
                <Link to="/search?category=adventure" className="hover:text-white transition-colors">
                  Adventures
                </Link>
              </li>
              <li>
                <Link to="/search?category=workshop" className="hover:text-white transition-colors">
                  Workshops
                </Link>
              </li>
              <li>
                <Link to="/search?category=event" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Hosting */}
          <div>
            <h3 className="font-semibold mb-4">Hosting</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Become a host
                </Link>
              </li>
              <li>
                <Link to="/vendor" className="hover:text-white transition-colors">
                  Host dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor/listings" className="hover:text-white transition-colors">
                  My listings
                </Link>
              </li>
              <li>
                <Link to="/vendor/earnings" className="hover:text-white transition-colors">
                  Earnings
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help centre
                </Link>
              </li>
              <li>
                <Link to="/help#safety" className="hover:text-white transition-colors">
                  Safety information
                </Link>
              </li>
              <li>
                <Link to="/help#cancellation" className="hover:text-white transition-colors">
                  Cancellation policy
                </Link>
              </li>
              <li>
                <Link to="/help#report" className="hover:text-white transition-colors">
                  Report a concern
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 33veyora. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/profile" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/profile" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/profile" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
