import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Users, 
  Heart, 
  Share2, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { listingApi } from '../../services/listing.api';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Listing {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  location: { address: string; city: string; state: string; country: string };
  price: { amountINR: number; amountUSD: number; unit: string };
  images: string[];
  amenities: string[];
  maxGuests: number;
  rating: number;
  reviewCount: number;
  vendor: { id: string; name: string; avatar: string };
  checkInTime?: string;
  checkOutTime?: string;
  rules?: string;
  cancellationPolicy?: string;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string };
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingData, reviewsData] = await Promise.all([
          listingApi.getById(id!),
          api.get(`/reviews/listing/${id}`).then(r => r.data)
        ]);
        setListing(listingData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.reviews || []);
      } catch (err) {
        console.error('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`);
      } else {
        await api.post('/wishlist', { listingId: id });
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Listing not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-slate-900 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8" style={{ height: 'auto', minHeight: '250px' }}>
          <div className="col-span-2 row-span-2">
            <img 
              src={listing.images?.[selectedImage] || listing.images?.[0] || '/placeholder.jpg'} 
              alt={listing.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {(listing.images || []).slice(1, 5).map((img, i) => (
            <div key={i} className="cursor-pointer" onClick={() => setSelectedImage(i + 1)}>
              <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span className="capitalize bg-slate-100 px-2 py-1 rounded-full">{listing.category}</span>
                <MapPin className="h-4 w-4" />
                <span>{listing.location?.city}, {listing.location?.state}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
              {listing.tagline && <p className="text-lg text-slate-600 mt-2">{listing.tagline}</p>}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{listing.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-slate-500">({listing.reviewCount || 0} reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>Up to {listing.maxGuests} guests</span>
                </div>
              </div>
            </div>

            {/* Host */}
            <div className="flex items-center justify-between py-6 border-y border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-slate-600">{listing.vendor?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Hosted by {listing.vendor?.name}</p>
                  <p className="text-sm text-slate-500">Superhost</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">
                <MessageSquare className="h-4 w-4" />
                Contact
              </button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">About this place</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{review.user?.name?.charAt(0) || 'U'}</span>
                      </div>
                      <span className="font-medium text-slate-900">{review.user?.name || 'Anonymous'}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">{review.comment}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="col-span-1 lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-slate-900">₹{(listing.price?.amountINR || 0).toLocaleString()}</span>
                <span className="text-slate-500">/ {listing.price?.unit || 'night'}</span>
              </div>

              <div className="space-y-3 mb-6">
                {listing.checkInTime && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Check-in: {listing.checkInTime}</span>
                  </div>
                )}
                {listing.checkOutTime && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Check-out: {listing.checkOutTime}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => user ? navigate(`/booking/${id}`) : navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all"
              >
                Reserve
              </button>

              <p className="text-center text-sm text-slate-500 mt-3">You won't be charged yet</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={toggleWishlist}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl transition-colors ${
                    isWishlisted ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
