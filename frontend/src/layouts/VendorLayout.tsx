import { Outlet } from 'react-router-dom';
import VendorSidebar from '../components/vendor/VendorSidebar';
import BackButton from '../components/common/BackButton';

export default function VendorLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <VendorSidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {/* Back arrow — top-left corner of every vendor page */}
          <div className="mb-4">
            <BackButton />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
