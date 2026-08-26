import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { listingApi } from '../../services/listing.api';
import { bookingApi } from '../../services/booking.api';

interface Listing {
  id: string;
  title: string;
  price: { amountINR: number };
  location: { city: string; state: string };
  maxGuests: number;
  images: string[];
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 1,
    specialRequests: '',
    paymentGateway: 'Razorpay' as 'Razorpay' | 'PayPal',
    paidCurrency: 'INR' as 'INR' | 'USD',
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingApi.getById(id!);
        setListing(data);
      } catch (err) {
        console.error('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const nights = formData.checkInDate && formData.checkOutDate
    ? Math.max(1, Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalAmount = nights * (listing?.price?.amountINR || 0);

  const handleSubmit = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await bookingApi.create({
        listingId: id!,
        ...formData,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-6">Your booking has been successfully created.</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">Book Your Stay</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Dates</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Check-in Date *</label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Date *</label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Guests</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Guests *</label>
                <input
                  type="number"
                  value={formData.guestsCount}
                  onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) })}
                  min={1}
                  max={listing?.maxGuests || 10}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-sm text-slate-500 mt-1">Max {listing?.maxGuests} guests allowed</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Special Requests</h2>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                placeholder="Any special requests or notes for the host..."
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, paymentGateway: 'Razorpay', paidCurrency: 'INR' })}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    formData.paymentGateway === 'Razorpay' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-slate-600 mb-2" />
                  <p className="font-medium text-slate-900">Razorpay (₹)</p>
                  <p className="text-sm text-slate-500">Pay in Indian Rupees</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, paymentGateway: 'PayPal', paidCurrency: 'USD' })}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    formData.paymentGateway === 'PayPal' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium text-slate-900">PayPal ($)</p>
                  <p className="text-sm text-slate-500">Pay in US Dollars</p>
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="col-span-1 lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
              <h3 className="font-semibold text-slate-900 mb-4">{listing?.title}</h3>
              {listing?.images?.[0] && (
                <img src={listing.images[0]} alt="" className="w-full h-32 object-cover rounded-xl mb-4" />
              )}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">₹{(listing?.price?.amountINR || 0).toLocaleString()} × {nights} nights</span>
                  <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Service fee</span>
                  <span className="font-medium">₹{Math.round(totalAmount * 0.12).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">₹{(totalAmount + Math.round(totalAmount * 0.12)).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || nights === 0}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
