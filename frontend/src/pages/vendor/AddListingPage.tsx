import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Plus, 
  X,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';

const categories = [
  'hotel', 'resort', 'villa', 'homestay', 'hostel', 'camp', 'adventure', 'workshop', 'event'
];

const amenities = [
  'WiFi', 'AC', 'Parking', 'Pool', 'Kitchen', 'TV', 'Gym', 'Spa', 'Laundry',
  'Room Service', 'Restaurant', 'Bar', 'Garden', 'Balcony', 'Hot Water', 'Power Backup'
];

export default function AddListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'homestay',
    location: { address: '', city: '', state: '', country: 'India' },
    price: { amountINR: 0, amountUSD: 0, unit: 'per night' },
    images: [] as string[],
    amenities: [] as string[],
    maxGuests: 2,
    minStay: 1,
    maxStay: 30,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    rules: '',
    cancellationPolicy: '',
    propertyType: '',
    roomType: '',
    totalRooms: 1,
  });

  const [imageInput, setImageInput] = useState('');

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let obj: any = newData;
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageInput.trim()] }));
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/listings', formData);
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Listing Created!</h2>
        <p className="text-slate-500 mb-6">Your listing is pending admin approval.</p>
        <button
          onClick={() => navigate('/vendor/listings')}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
        >
          View My Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Listing</h1>
          <p className="text-slate-500 mt-1">Step {step} of 3</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-10 h-2 rounded-full ${s <= step ? 'bg-slate-900' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              placeholder="e.g., Cozy Mountain Retreat in Manali"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              placeholder="A short catchy description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              placeholder="Describe your property in detail..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Guests *</label>
              <input
                type="number"
                value={formData.maxGuests}
                onChange={(e) => handleChange('maxGuests', parseInt(e.target.value))}
                min={1}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location & Pricing */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Location & Pricing</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => handleChange('location.address', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) => handleChange('location.city', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
              <input
                type="text"
                value={formData.location.state}
                onChange={(e) => handleChange('location.state', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.location.country}
                onChange={(e) => handleChange('location.country', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                value={formData.price.amountINR}
                onChange={(e) => handleChange('price.amountINR', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                placeholder="Per night"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Stay (nights)</label>
              <input
                type="number"
                value={formData.minStay}
                onChange={(e) => handleChange('minStay', parseInt(e.target.value))}
                min={1}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-in Time</label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => handleChange('checkInTime', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Time</label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => handleChange('checkOutTime', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Images & Amenities */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Images</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                placeholder="Paste image URL"
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
              />
              <button
                onClick={addImage}
                className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-full h-32 object-cover rounded-xl" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenities.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Policies</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">House Rules</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => handleChange('rules', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., No smoking, No pets..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cancellation Policy</label>
                <textarea
                  value={formData.cancellationPolicy}
                  onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., Free cancellation up to 48 hours before check-in..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
          >
            Next
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        )}
      </div>
    </div>
  );
}
