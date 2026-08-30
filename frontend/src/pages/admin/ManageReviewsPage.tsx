import { useState, useEffect } from 'react';
import {
  Star, CheckCircle, Trash2, Search, RefreshCw, MessageSquare, Calendar
} from 'lucide-react';
import { adminApi } from '../../services/admin.api';

interface AdminReview {
  id: string;
  guestName: string;
  listingTitle: string;
  listingLocation: string;
  rating: number;
  comment: string;
  hostResponse: string | null;
  isVerified: boolean;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReviews();
      const raw = data?.reviews || [];
      setReviews(raw.map((r: any) => ({
        id: r.id,
        guestName: r.guest_name || 'Guest',
        listingTitle: r.listing_title || 'Listing',
        listingLocation: r.location_city || '',
        rating: r.rating || 0,
        comment: r.comment || '',
        hostResponse: r.host_response || null,
        isVerified: (r.is_verified ?? 0) === 1 || r.is_verified === true,
        createdAt: r.created_at || new Date().toISOString(),
      })));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActingId(id);
      await adminApi.moderateReview(id, 'approve');
      setReviews(reviews.map(r => (r.id === id ? { ...r, isVerified: true } : r)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve review');
    } finally {
      setActingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this review permanently? This cannot be undone.')) return;
    try {
      setActingId(id);
      await adminApi.moderateReview(id, 'reject');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove review');
    } finally {
      setActingId(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'verified' && review.isVerified) ||
      (filter === 'unverified' && !review.isVerified);
    const matchesSearch =
      review.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.listingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={fetchReviews} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Reviews</h1>
          <p className="text-slate-500 mt-1">{reviews.length} total reviews</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest or listing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'unverified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-slate-600">
                    {review.guestName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{review.guestName}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      review.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {review.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    on <span className="font-medium text-slate-700">{review.listingTitle}</span>
                    {review.listingLocation ? ` · ${review.listingLocation}` : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {review.comment && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">{review.comment}</p>
              </div>
            )}

            {review.hostResponse && (
              <div className="mt-3 p-4 bg-indigo-50 rounded-xl">
                <p className="text-xs font-semibold text-indigo-700 mb-1">Host response</p>
                <p className="text-sm text-indigo-900">{review.hostResponse}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              {!review.isVerified && (
                <button
                  onClick={() => handleApprove(review.id)}
                  disabled={actingId === review.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              )}
              <button
                onClick={() => handleRemove(review.id)}
                disabled={actingId === review.id}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
            <p className="text-slate-500">
              {filter === 'all' ? 'No reviews have been submitted yet.' : `No ${filter} reviews found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
