import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Extra positioning classes, e.g. "fixed left-4 top-20 z-40" */
  className?: string;
}

/**
 * Back arrow shown in the top-left corner of every page.
 * Clicking navigates to the previous page (or home if there is no history).
 */
export default function BackButton({ className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 ${className}`}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}