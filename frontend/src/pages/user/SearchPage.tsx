import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import api from '../../services/api';
import { searchLocations, type CitySuggestion } from '../../data/indianLocations';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'hotel', name: 'Hotels' },
  { id: 'resort', name: 'Resorts' },
  { id: 'villa', name: 'Villas' },
  { id: 'homestay', name: 'Homestays' },
  { id: 'hostel', name: 'Hostels' },
  { id: 'camp', name: 'Camps' },
  { id: 'adventure', name: 'Adventures' },
  { id: 'workshop', name: 'Workshops' },
  { id: 'event', name: 'Events' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || searchParams.get('location') || '',
    category: searchParams.get('category') || 'all',
    maxPrice: searchParams.get('maxPrice') || '',
    city: searchParams.get('city') || searchParams.get('search') || searchParams.get('location') || '',
  });
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  useEffect(() => {
    fetchListings();
  }, [filters]);
  
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.city) params.city = filters.city;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      
      const response = await api.get('/listings', { params });
      setListings(response.data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Discover Experiences</h1>
          
          {/* Search Bar */}
          <div className="flex gap-4">
            <div ref={searchRef} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({ ...filters, search: val, city: val });
                  if (val.length >= 1) {
                    const results = searchLocations(val);
                    setCitySuggestions(results);
                    setShowSuggestions(results.length > 0);
                  } else {
                    setCitySuggestions([]);
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (filters.search.length >= 1) {
                    const results = searchLocations(filters.search);
                    setCitySuggestions(results);
                    setShowSuggestions(results.length > 0);
                  }
                }}
                placeholder="Search by city, location, or name..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {showSuggestions && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                  {citySuggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setFilters({ ...filters, search: s.city, city: s.city });
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm flex items-center gap-2 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{s.city}</span>
                      <span className="text-slate-400">, {s.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={fetchListings}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={filters.category === cat.id}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="text-indigo-600"
                      />
                      <span className="text-sm text-slate-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500">No listings found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {listings.map((listing) => (
                  <a
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={listing.images?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                        {listing.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                        <MapPin className="h-4 w-4" />
                        {listing.location_city}, {listing.location_state}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{listing.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{listing.rating?.toFixed(1) || 'New'}</span>
                        </div>
                        <div>
                          <span className="text-lg font-bold text-slate-900">₹{listing.price_inr?.toLocaleString()}</span>
                          <span className="text-sm text-slate-500"> /{listing.price_unit}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
