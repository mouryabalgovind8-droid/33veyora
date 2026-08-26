import { Outlet } from 'react-router-dom';
import VendorSidebar from '../components/vendor/VendorSidebar';

export default function VendorLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <VendorSidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
