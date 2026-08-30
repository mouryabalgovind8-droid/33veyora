import React, { useState, useRef, useEffect } from 'react';
import { X, PlusCircle, MapPin } from 'lucide-react';
import { CategoryType } from '../types';
import { searchLocations, searchStates, type CitySuggestion, type StateData } from '../data/indianLocations';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: () => void;
}

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {

  const [category, setCategory] = useState<CategoryType>('homestay');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [stateSuggestions, setStateSuggestions] = useState<StateData[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setShowStateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [title, setTitle] = useState('');
  const [priceINR, setPriceINR] = useState(5000);
  const [priceUSD, setPriceUSD] = useState(60);
  const [priceUnit, setPriceUnit] = useState<'night' | 'person' | 'session'>('night');
  const [maxGuests, setMaxGuests] = useState(4);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
  );
  const [amenitiesStr, setAmenitiesStr] = useState('Wi-Fi, Free Parking, Kitchen, Breakfast Included');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Event schedule — required when category is 'event'
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [prebookingEnabled, setPrebookingEnabled] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Event validation — start & end are mandatory for events
      let eventStartIso: string | undefined;
      let eventEndIso: string | undefined;
      if (category === 'event') {
        if (!eventStart || !eventEnd) {
          alert('Please specify when the event starts and ends');
          setIsSubmitting(false);
          return;
        }
        const start = new Date(eventStart);
        const end = new Date(eventEnd);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
          alert('Event end must be after event start');
          setIsSubmitting(false);
          return;
        }
        eventStartIso = start.toISOString();
        eventEndIso = end.toISOString();
      }

      const payload = {
        title,
        category,
        tagline,
        description,
        locationAddress: address,
        locationCity: city,
        locationState: state,
        locationCountry: 'India',
        priceInr: Number(priceINR),
        priceUsd: Number(priceUSD),
        priceUnit,
        maxGuests: Number(maxGuests),
        images: [imageUrl],
        amenities: amenitiesStr.split(',').map((s) => s.trim()),
        ...(category === 'event'
          ? {
              eventStart: eventStartIso,
              eventEnd: eventEndIso,
              prebookingEnabled,
              maxParticipants: Number(maxParticipants),
            }
          : {}),
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onListingCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 text-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl">
              <PlusCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Publish New Stay or Experience</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Cedar Forest Chalet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="villa">Villa</option>
                <option value="homestay">Homestay</option>
                <option value="hostel">Hostel</option>
                <option value="camp">Camp / Glamping</option>
                <option value="adventure">Outdoor &amp; Adventure</option>
                <option value="workshop">Creative Workshop</option>
                <option value="event">Event / Gathering</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Short Tagline</label>
            <input
              type="text"
              required
              placeholder="e.g. Panoramic glass chalet with cedar hot tub"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Full Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* City Autocomplete */}
            <div ref={cityRef} className="relative">
              <label className="block text-slate-600 mb-1 font-semibold">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setState(''); // clear state when typing city
                  const results = searchLocations(e.target.value);
                  setCitySuggestions(results);
                  setShowCityDropdown(results.length > 0);
                }}
                onFocus={() => {
                  if (city.length > 0) {
                    const results = searchLocations(city);
                    setCitySuggestions(results);
                    setShowCityDropdown(results.length > 0);
                  }
                }}
                placeholder="Type city name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
              {showCityDropdown && citySuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {citySuggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setCity(s.city);
                        setState(s.state);
                        setShowCityDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{s.city}</span>
                      <span className="text-slate-400">, {s.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* State Autocomplete */}
            <div ref={stateRef} className="relative">
              <label className="block text-slate-600 mb-1 font-semibold">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const results = searchStates(e.target.value);
                  setStateSuggestions(results);
                  setShowStateDropdown(results.length > 0);
                }}
                onFocus={() => {
                  if (state.length > 0) {
                    const results = searchStates(state);
                    setStateSuggestions(results);
                    setShowStateDropdown(results.length > 0);
                  }
                }}
                placeholder="Type state name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
              {showStateDropdown && stateSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {stateSuggestions.map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setState(s.name);
                        setShowStateDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{s.name}</span>
                      <span className="text-slate-400 text-xs">({s.cities.length} cities)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, area, landmark"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Full address is required for listings</p>
            </div>
          </div>

          {/* Event Schedule — required for event listings */}
          {category === 'event' && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 space-y-3">
              <p className="font-semibold text-rose-700">Event Schedule * <span className="font-normal text-slate-500">(guests can pre-book until it starts)</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Event Starts *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full bg-slate-50 border border-rose-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Event Ends *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-rose-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Max Participants</label>
                  <input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 50)}
                    className="w-full bg-slate-50 border border-rose-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
                  <input
                    type="checkbox"
                    checked={prebookingEnabled}
                    onChange={(e) => setPrebookingEnabled(e.target.checked)}
                    className="w-4 h-4 text-rose-500"
                  />
                  <span className="text-slate-600 font-semibold">Allow pre-booking</span>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Price (₹ INR)</label>
              <input
                type="number"
                required
                value={priceINR}
                onChange={(e) => setPriceINR(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Price ($ USD)</label>
              <input
                type="number"
                required
                value={priceUSD}
                onChange={(e) => setPriceUSD(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Price Per</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="night">Night</option>
                <option value="person">Person</option>
                <option value="session">Session</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Cover Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Amenities (Comma-separated)</label>
            <input
              type="text"
              value={amenitiesStr}
              onChange={(e) => setAmenitiesStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Experience to Live Directory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
