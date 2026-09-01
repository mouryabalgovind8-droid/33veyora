import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Every route change pe page ko top se shuru karta hai.
 * Bina iske, browse me neeche scroll karke dusre tab pe jane
 * par wo usi scroll position se khulta hai.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}