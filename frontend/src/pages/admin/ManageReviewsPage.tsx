import { useState } from 'react';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  User,
  MapPin,
  Filter,
  Search
} from 'lucide-react';

type ReviewStatus = 'pending' | 'approved' | 'flagged' | 'rejected';

interface Review {
  id: string;
  guestName: string;
  guestAvatar: string;
  listingName: string;
  listingLocation: string;
  rating: number;
  subRatings: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
  };
  comment: string;
  hostResponse?: string;
  status: ReviewStatus;
  createdAt: Date;
  flaggedReason?: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    guestName: 'Priya Sharma',
    guestAvatar: 'P',
    listingName: 'Luxury Villa in Goa',
    listingLocation: 'Goa, India',
    rating: 5,
    subRatings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
    comment: 'Absolutely amazing stay! The villa was spotless and the host was incredibly welcoming. The pool area was stunning and the views were breathtaking. Will definitely come back!',
    status: 'approved',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '2',
    guestName: 'Rahul Verma',
    guestAvatar: 'R',
    listingName: 'Mountain View Cabin',
    listingLocation: 'Manali, India',
    rating: 4,
    subRatings: { cleanliness: 4, accuracy: 4, communication: 5, location: 4, value: 4 },
    comment: 'Great cabin with beautiful mountain views. The heating worked well and the kitchen was fully equipped. Only minor issue was the WiFi was a bit slow.',
    hostResponse: 'Thank you for your stay! We\'re working on upgrading our WiFi infrastructure. Hope to host you again soon!',
    status: 'pending',
    createdAt: new Date('2024-02-12'),
  },
  {
    id: '3',
    guestName: 'Anonymous User',
    guestAvatar: 'A',
    listingName: 'Heritage Haveli Stay',
    listingLocation: 'Jaipur, India',
    rating: 2,
    subRatings: { cleanliness: 2, accuracy: 3, communication: 1, location: 3, value: 2 },
    comment: 'This place is terrible! Don\'t book it. The host is a scammer and the photos are fake.',
    status: 'flagged',
    createdAt: new Date('2024-02-14'),
    flaggedReason: 'Potentially fake review - language violation',
  },
];

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter;
    const matchesSearch = 
      review.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.listingName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const handleApprove = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'approved' as ReviewStatus } : r
    ));
    setSelectedReview(null);
  };
  
  const handleReject = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'rejected' as ReviewStatus } : r
    ));
    setSelectedReview(null);
  };
  
  const handleFlag = (id: string, reason: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'flagged' as ReviewStatus, flaggedReason: reason } : r
    ));
  };
  
  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      case 'rejected': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
      />
    ));
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reviews Moderation</h1>
        <p className="text-slate-500 mt-1">Monitor and moderate guest reviews</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Reviews</p>
          <p className="text-2xl font-bold text-slate-900">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {reviews.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Flagged</p>
          <p className="text-2xl font-bold text-red-600">
            {reviews.filter(r => r.status === 'flagged').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Avg. Rating</p>
          <p className="text-2xl font-bold text-slate-900">4.2</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest or listing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div 
            key={review.id}
            className={`bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow ${
              review.status === 'flagged' ? 'border-red-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-slate-600">{review.guestAvatar}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{review.guestName}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(review.status)}`}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span>{review.listingName} • {review.listingLocation}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm font-medium text-slate-600">{review.rating}.0</span>
              </div>
            </div>
            
            {/* Sub-ratings */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4 py-3 px-4 bg-slate-50 rounded-xl">
              {Object.entries(review.subRatings).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-xs text-slate-500 capitalize">{key}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {renderStars(value)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Comment */}
            <p className="mt-4 text-slate-700 leading-relaxed">{review.comment}</p>
            
            {/* Host Response */}
            {review.hostResponse && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium text-slate-700 mb-1">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Host Response
                </p>
                <p className="text-sm text-slate-600">{review.hostResponse}</p>
              </div>
            )}
            
            {/* Flagged Reason */}
            {review.flaggedReason && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Flagged for review</p>
                  <p className="text-sm text-red-600">{review.flaggedReason}</p>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              {review.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}
              
              {review.status === 'flagged' && (
                <>
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Anyway
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Remove Review
                  </button>
                </>
              )}
              
              {review.status === 'approved' && (
                <button
                  onClick={() => handleFlag(review.id, 'Flagged by admin for review')}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Flag Review
                </button>
              )}
            </div>
          </div>
        ))}
        
        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
            <p className="text-slate-500">
              {filter === 'all' 
                ? "No reviews have been submitted yet."
                : `No ${filter} reviews found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
