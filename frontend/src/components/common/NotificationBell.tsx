import { useState } from 'react';
import { Bell, Check, CheckCheck, X, Calendar, Star, MessageSquare, CreditCard, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'review' | 'message' | 'payment' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'Priya Sharma wants to book Luxury Villa in Goa for Feb 15-18',
    time: '5 min ago',
    read: false,
    link: '/vendor/bookings',
  },
  {
    id: '2',
    type: 'review',
    title: 'New Review Received',
    message: 'Rahul Verma left a 4-star review on Mountain View Cabin',
    time: '1 hour ago',
    read: false,
    link: '/vendor/listings',
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    message: '₹8,000 has been credited to your account',
    time: '2 hours ago',
    read: true,
    link: '/vendor/earnings',
  },
  {
    id: '4',
    type: 'system',
    title: 'Verification Approved',
    message: 'Your Aadhar Card has been verified successfully',
    time: '1 day ago',
    read: true,
    link: '/vendor/kyc',
  },
];

const typeIcons: Record<string, any> = {
  booking: Calendar,
  review: Star,
  message: MessageSquare,
  payment: CreditCard,
  system: AlertCircle,
};

const typeColors: Record<string, string> = {
  booking: 'bg-blue-100 text-blue-600',
  review: 'bg-amber-100 text-amber-600',
  message: 'bg-green-100 text-green-600',
  payment: 'bg-purple-100 text-purple-600',
  system: 'bg-slate-100 text-slate-600',
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const clearAll = () => {
    setNotifications([]);
  };
  
  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = typeIcons[notification.type];
                  const colorClass = typeColors[notification.type];
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                      className={`px-5 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={clearAll}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
