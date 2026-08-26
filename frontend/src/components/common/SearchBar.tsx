import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchLocations, type CitySuggestion } from '../../data/indianLocations';

// Premium Date Picker
function DatePicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);
    const formatted = selected.toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const isPast = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (day: number) => {
    const date = new Date(year, month, day);
    return value === date.toISOString().split('T')[0];
  };

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div ref={ref} className="relative flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
      >
        <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-slate-500 mb-0.5">{placeholder}</label>
          <span className={`text-sm ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {formatDisplay(value)}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-slate-900">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1))}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <button
                key={idx}
                disabled={!day || isPast(day)}
                onClick={() => day && !isPast(day) && handleDateClick(day)}
                className={`aspect-square flex items-center justify-center text-sm rounded-full transition-all
                  ${!day ? 'invisible' : ''}
                  ${day && isPast(day) ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}
                  ${day && isSelected(day) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Quick dates */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                onChange(tomorrow.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Tomorrow
            </button>
            <button
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                onChange(nextWeek.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Next week
            </button>
            <button
              onClick={() => {
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                onChange(nextMonth.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Next month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Guests Selector
function GuestsSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const guestOptions = [
    { value: 1, label: '1 guest', desc: 'Solo traveller' },
    { value: 2, label: '2 guests', desc: 'Couple' },
    { value: 3, label: '3 guests', desc: 'Small group' },
    { value: 4, label: '4 guests', desc: 'Family' },
    { value: 5, label: '5 guests', desc: 'Large group' },
    { value: 6, label: '6+ guests', desc: 'Party time' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
      >
        <Users className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-slate-500 mb-0.5">Guests</label>
          <span className={`text-sm ${value > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
            {value > 0 ? guestOptions.find(o => o.value === value)?.label : 'Add guests'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {guestOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors
                ${value === option.value ? 'bg-slate-100' : 'hover:bg-slate-50'}
              `}
            >
              <div className="text-left">
                <p className="font-medium text-slate-900">{option.label}</p>
                <p className="text-xs text-slate-500">{option.desc}</p>
              </div>
              {value === option.value && (
                <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Search Bar
export default function SearchBar({ variant = 'hero' }: { variant?: 'hero' | 'compact' }) {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(0);
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (value.length >= 1) {
      const results = searchLocations(value);
      setCitySuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    setLocation(suggestion.city);
    setShowSuggestions(false);
    // Immediately search with the selected city
    const params = new URLSearchParams();
    params.set('location', suggestion.city);
    params.set('city', suggestion.city);
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    if (guests > 0) params.set('guests', guests.toString());
    window.location.href = `/search?${params.toString()}`;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) {
      params.set('location', location);
      params.set('city', location);
    }
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    if (guests > 0) params.set('guests', guests.toString());
    window.location.href = `/search?${params.toString()}`;
  };

  if (variant === 'compact') {      return (
      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-slate-200 px-2 py-1 relative">
        <div className="flex items-center gap-2 px-3 relative">
          <MapPin className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => {
              if (location.length >= 1) {
                const results = searchLocations(location);
                setCitySuggestions(results);
                setShowSuggestions(results.length > 0);
              }
            }}
            placeholder="Search destinations"
            className="w-32 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50">
              {citySuggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex items-center gap-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{s.city}</span>
                  <span className="text-slate-400">, {s.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <button
          onClick={handleSearch}
          className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full">
      <div className="flex flex-col md:flex-row">
        {/* Location */}
        <div ref={locationRef} className="flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 relative">
          <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => {
                if (location.length >= 1) {
                  const results = searchLocations(location);
                  setCitySuggestions(results);
                  setShowSuggestions(results.length > 0);
                }
              }}
              placeholder="Where are you going?"
              className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50">
              {citySuggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex items-center gap-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{s.city}</span>
                  <span className="text-slate-400">, {s.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Check in */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-100">
          <DatePicker value={checkIn} onChange={setCheckIn} placeholder="Check in" />
        </div>

        {/* Check out */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-100">
          <DatePicker value={checkOut} onChange={setCheckOut} placeholder="Check out" />
        </div>

        {/* Guests */}
        <div className="flex-1">
          <GuestsSelector value={guests} onChange={setGuests} />
        </div>

        {/* Search Button */}
        <div className="flex items-center p-2">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors w-full md:w-auto"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
