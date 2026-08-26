import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  Calendar, 
  CreditCard,
  Tag,
  Percent,
  Star,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Store, label: 'Vendors', path: '/admin/vendors' },
  { icon: Package, label: 'Listings', path: '/admin/listings' },
  { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
  { icon: CreditCard, label: 'Refunds', path: '/admin/refunds' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: Percent, label: 'Commission', path: '/admin/commission' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link to="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl font-bold text-indigo-400">33v</span>
          <span className="text-sm font-medium text-slate-400">33veyora</span>
        </Link>
      </div>
      
      <nav className="px-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button
          onClick={() => { logout(); setMobileOpen(false); }}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 bg-slate-900 text-white fixed h-full z-40">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  );
}
