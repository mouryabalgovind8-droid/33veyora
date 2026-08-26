import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// User pages
import HomePage from './pages/user/HomePage';
import SearchPage from './pages/user/SearchPage';
import ListingDetailPage from './pages/user/ListingDetailPage';
import BookingPage from './pages/user/BookingPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import ProfilePage from './pages/user/ProfilePage';
import WishlistPage from './pages/user/WishlistPage';
import HelpCentrePage from './pages/user/HelpCentrePage';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import AddListingPage from './pages/vendor/AddListingPage';
import VendorManageListingsPage from './pages/vendor/ManageListingsPage';
import VendorBookingsPage from './pages/vendor/VendorBookingsPage';
import VendorEarningsPage from './pages/vendor/VendorEarningsPage';
import VendorKYCPage from './pages/vendor/VendorKYCPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageVendorsPage from './pages/admin/ManageVendorsPage';
import AdminManageListingsPage from './pages/admin/ManageListingsPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageRefundsPage from './pages/admin/ManageRefundsPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageCommissionPage from './pages/admin/ManageCommissionPage';
import ManageReviewsPage from './pages/admin/ManageReviewsPage';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* User routes */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="listing/:id" element={<ListingDetailPage />} />
        <Route 
          path="booking/:id" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-bookings" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyBookingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute allowedRoles={['user', 'vendor', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="wishlist" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <WishlistPage />
            </ProtectedRoute>
          } 
        />
        <Route path="help" element={<HelpCentrePage />} />
      </Route>
      
      {/* Vendor routes */}
      <Route 
        path="/vendor" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="add-listing" element={<AddListingPage />} />
        <Route path="listings" element={<VendorManageListingsPage />} />
        <Route path="bookings" element={<VendorBookingsPage />} />
        <Route path="earnings" element={<VendorEarningsPage />} />
        <Route path="kyc" element={<VendorKYCPage />} />
      </Route>
      
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="vendors" element={<ManageVendorsPage />} />
        <Route path="listings" element={<AdminManageListingsPage />} />
        <Route path="bookings" element={<ManageBookingsPage />} />
        <Route path="refunds" element={<ManageRefundsPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="commission" element={<ManageCommissionPage />} />
        <Route path="reviews" element={<ManageReviewsPage />} />
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
