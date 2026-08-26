import { useState, useEffect } from 'react';
import { Heart, Trash2, MapPin, Star, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface WishlistItem {
  id: string;
  listingId: string;
  listing?: {
    id: string;
    title: string;
    category: string;
    price: { amountINR: number };
    images: string[];
    location: { city: string; state: string };
    rating: number;
  };
  createdAt: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setItems(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch (err) {
      console.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (listingId: string) => {
    try {
      await api.delete(`/wishlist/${listingId}`);
      setItems(items.filter(item => item.listingId !== listingId));
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Wishlist</h1>
        <p className="text-slate-500 mb-8">{items.length} saved {items.length === 1 ? 'listing' : 'listings'}</p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No saved listings</h2>
            <p className="text-slate-500 mb-6">Start exploring and save your favorite places!</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
            >
              Browse Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {items.map((item) => {
              const listing = item.listing;
              if (!listing) return null;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-56 object-cover" />
                    ) : (
                      <div className="w-full h-56 bg-slate-100 flex items-center justify-center">
                        <Heart className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    <button
                      onClick={() => removeItem(item.listingId)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow-sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4 cursor-pointer" onClick={() => navigate(`/listing/${listing.id}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 px-2 py-1 rounded-full">{listing.category}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium">{listing.rating?.toFixed(1) || 'New'}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{listing.location?.city}, {listing.location?.state}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      ₹{(listing.price?.amountINR || 0).toLocaleString()}
                      <span className="text-sm font-normal text-slate-500"> / night</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
