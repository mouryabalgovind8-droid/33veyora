import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Shield, CreditCard, Heart, 
  Settings, LogOut, ChevronRight, Camera, Star,
  MapPin, Calendar, Edit2, Check, X, Bell, HelpCircle,
  KeyRound, Plus
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleLogout = () => {
    logout();
  };
  
  // Role-based quick actions — each user type only sees their own permissions
  const menuItems = user?.role === 'vendor' ? [
    { 
      id: 'dashboard', 
      label: 'Vendor Dashboard', 
      icon: <Shield className="h-5 w-5" />,
      description: 'Manage your host account',
      link: '/vendor',
      color: 'bg-amber-100 text-amber-600'
    },
    { 
      id: 'add-listing', 
      label: 'Upload Listing / Event', 
      icon: <Plus className="h-5 w-5" />,
      description: 'Add a new stay or event',
      link: '/vendor/add-listing',
      color: 'bg-indigo-100 text-indigo-600'
    },
    { 
      id: 'listings', 
      label: 'My Listings', 
      icon: <MapPin className="h-5 w-5" />,
      description: 'Manage what you host',
      link: '/vendor/listings',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'bookings', 
      label: 'Guest Bookings', 
      icon: <Calendar className="h-5 w-5" />,
      description: 'Bookings from your guests',
      link: '/vendor/bookings',
      color: 'bg-green-100 text-green-600'
    },
    { 
      id: 'help', 
      label: 'Help Centre', 
      icon: <HelpCircle className="h-5 w-5" />,
      description: 'Get support and answers',
      link: '/help',
      color: 'bg-amber-100 text-amber-600'
    },
  ] : user?.role === 'admin' ? [
    { 
      id: 'dashboard', 
      label: 'Admin Dashboard', 
      icon: <Shield className="h-5 w-5" />,
      description: 'Platform overview & stats',
      link: '/admin',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      id: 'users', 
      label: 'Manage Users', 
      icon: <User className="h-5 w-5" />,
      description: 'User accounts & roles',
      link: '/admin/users',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'vendors', 
      label: 'Manage Vendors', 
      icon: <KeyRound className="h-5 w-5" />,
      description: 'Verification & approvals',
      link: '/admin/vendors',
      color: 'bg-amber-100 text-amber-600'
    },
    { 
      id: 'listings', 
      label: 'Manage Listings', 
      icon: <MapPin className="h-5 w-5" />,
      description: 'Approve or reject listings',
      link: '/admin/listings',
      color: 'bg-green-100 text-green-600'
    },
    { 
      id: 'help', 
      label: 'Help Centre', 
      icon: <HelpCircle className="h-5 w-5" />,
      description: 'Get support and answers',
      link: '/help',
      color: 'bg-amber-100 text-amber-600'
    },
  ] : [
    { 
      id: 'bookings', 
      label: 'My Bookings', 
      icon: <Calendar className="h-5 w-5" />,
      description: 'View and manage your bookings',
      link: '/my-bookings',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'wishlist', 
      label: 'Wishlist', 
      icon: <Heart className="h-5 w-5" />,
      description: 'Your saved favourites',
      link: '/wishlist',
      color: 'bg-pink-100 text-pink-600'
    },
    { 
      id: 'payments', 
      label: 'Payment Methods', 
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Manage your payment options',
      link: '#',
      color: 'bg-green-100 text-green-600'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: <Bell className="h-5 w-5" />,
      description: 'Notification preferences',
      link: '#',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      id: 'help', 
      label: 'Help Centre', 
      icon: <HelpCircle className="h-5 w-5" />,
      description: 'Get support and answers',
      link: '/help',
      color: 'bg-amber-100 text-amber-600'
    },
  ];
  
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30"></div>
      </div>
      
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Camera className="h-5 w-5 text-slate-600" />
                </button>
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'User'}</h1>
                <p className="text-slate-500 mt-1">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                  {user?.role === 'vendor' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-semibold">
                      <KeyRound className="h-4 w-4" />
                      Host
                    </span>
                  ) : user?.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-semibold">
                      <Shield className="h-4 w-4" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-semibold">
                      <User className="h-4 w-4" />
                      Guest
                    </span>
                  )}
                  <span className="text-sm text-slate-500">
                    Member since 2026
                  </span>
                </div>
              </div>
              
              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="py-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Info Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h2>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                      <p className="text-slate-900 font-medium">{user?.name || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Mail className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                      <p className="text-slate-900 font-medium">{user?.email || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Phone className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                      <p className="text-slate-900 font-medium">Not provided</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-500 mb-1">Location</label>
                      <p className="text-slate-900 font-medium">India</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {menuItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.link}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                      </Link>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Shield className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Password</p>
                        <p className="text-sm text-slate-500">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Change
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Email Verification</p>
                        <p className="text-sm text-slate-500">Your email is verified</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Phone Number</p>
                        <p className="text-sm text-slate-500">Add a phone number for security</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Bell className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-500">Receive booking updates via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Settings className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Currency</p>
                        <p className="text-sm text-slate-500">Default currency for prices</p>
                      </div>
                    </div>
                    <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Heart className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Marketing Emails</p>
                        <p className="text-sm text-slate-500">Receive deals and offers</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
