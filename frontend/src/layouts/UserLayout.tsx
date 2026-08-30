import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BackButton from '../components/common/BackButton';

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      {/* Back arrow — top-left corner of every user-facing page */}
      <BackButton className="fixed left-4 top-[4.5rem] z-40" />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
