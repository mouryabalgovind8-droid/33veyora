import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  // Support direct links like /vendor/add-listing?category=event
  const initialCategory = searchParams.get('category') === 'event' ? 'event' : 'homestay';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: initialCategory,
    location: { address: '', city: '', state: '', country: 'India' },
    price: { amountINR: 0, amountUSD: 0, unit: 'night' },
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

  // PC se photo upload — hidden file picker + Cloudinary upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Event schedule state — hosts must specify when the event starts & ends
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [prebookingEnabled, setPrebookingEnabled] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(50);

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

  // + button se PC/laptop se photos choose hoti hai — backend unhe
  // Cloudinary pe upload karta hai aur yaha URL add ho jata hai
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // same file dobara select kar sake
    if (files.length === 0) return;

    setUploadingImages(true);
    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const data = new FormData();
        data.append('image', file);
        const res = await api.post('/upload/image', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.url) uploaded.push(res.data.url);
      } catch (err: any) {
        alert(err?.response?.data?.error || `Upload failed for ${file.name}`);
      }
    }
    if (uploaded.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
    }
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    // Basic client-side validation (backend requires these)
    if (!formData.location.address || !formData.location.city || !formData.location.state) {
      alert('Address, city and state are required');
      return;
    }

    // Event schedule validation — hosts must specify when the event starts & ends
    let eventStartIso: string | undefined;
    let eventEndIso: string | undefined;
    if (formData.category === 'event') {
      if (!eventStart || !eventEnd) {
        alert('Please specify when the event starts and ends');
        return;
      }
      const start = new Date(eventStart);
      const end = new Date(eventEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        alert('Event end must be after event start');
        return;
      }
      eventStartIso = start.toISOString();
      eventEndIso = end.toISOString();
    }

    try {
      setLoading(true);
      // Flat payload matching the backend createListing contract
      await api.post('/listings', {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        category: formData.category,
        locationAddress: formData.location.address,
        locationCity: formData.location.city,
        locationState: formData.location.state,
        locationCountry: formData.location.country,
        priceInr: Number(formData.price.amountINR),
        priceUsd: Number(formData.price.amountUSD),
        priceUnit: formData.price.unit,
        maxGuests: formData.maxGuests,
        images: formData.images,
        amenities: formData.amenities,
        rules: formData.rules
          ? formData.rules.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : [],
        cancellationPolicy: formData.cancellationPolicy,
        minDays: formData.minStay,
        maxDays: formData.maxStay,
        ...(formData.category === 'event'
          ? {
              eventStart: eventStartIso,
              eventEnd: eventEndIso,
              prebookingEnabled,
              maxParticipants: Number(maxParticipants),
            }
          : {}),
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create listing');
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
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                placeholder="Paste image URL and press Enter"
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
              />
              {/* + button — photo DIRECT computer/PC se upload hogi (Cloudinary cloud pe save) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                title="Upload photos from your computer"
                className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center"
              >
                {uploadingImages ? (
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              + button dabaao aur apne computer se photos choose karo (multiple select ho sakta hai). Ya URL paste karke Enter dabao.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
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

          {/* Event Schedule — required for event listings */}
          {formData.category === 'event' && (
            <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Event Schedule</h2>
              <p className="text-sm text-rose-600 mb-4">
                Guests can pre-book this event until it starts. Specify when it begins and ends.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Starts *</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Ends *</label>
                  <input
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 50)}
                    min={1}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prebookingEnabled}
                      onChange={(e) => setPrebookingEnabled(e.target.checked)}
                      className="w-5 h-5 text-rose-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Allow pre-booking</span>
                  </label>
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
