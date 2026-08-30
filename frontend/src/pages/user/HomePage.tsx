import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, ChevronRight, MapPin, CalendarClock } from 'lucide-react';
import api from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import { StaysIcon, AdventuresIcon, WorkshopsIcon, EventsIcon, IconBackground } from '../../components/common/IllustratedIcons';
import EventCard, { EventListing, getEventStatus } from '../../components/common/EventCard';
import EventPreBookModal from '../../components/common/EventPreBookModal';

const categories = [
  { 
    id: 'hotel', 
    name: 'Hotels', 
    icon: <StaysIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    count: '1,200+'
  },
  { 
    id: 'resort', 
    name: 'Resorts', 
    icon: <StaysIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    count: '860+'
  },
  { 
    id: 'villa', 
    name: 'Villas', 
    icon: <StaysIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-amber-100 to-orange-100',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    count: '540+'
  },
  { 
    id: 'homestay', 
    name: 'Homestays', 
    icon: <StaysIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    count: '2,400+'
  },
  { 
    id: 'hostel', 
    name: 'Hostels', 
    icon: <StaysIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    count: '320+'
  },
  { 
    id: 'camp', 
    name: 'Camps', 
    icon: <StaysIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-lime-100 to-green-100',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    count: '180+'
  },
  { 
    id: 'adventure', 
    name: 'Adventures', 
    icon: <AdventuresIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80',
    count: '890+'
  },
  { 
    id: 'workshop', 
    name: 'Workshops', 
    icon: <WorkshopsIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    count: '650+'
  },
  { 
    id: 'event', 
    name: 'Events', 
    icon: <EventsIcon className="w-10 h-10" />,
    bgColor: 'bg-gradient-to-br from-pink-100 to-rose-100',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    count: '320+'
  },
];

const destinations = [
  {
    id: '1',
    name: 'Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    count: '1,200+ stays',
  },
  {
    id: '2',
    name: 'Manali',
    image: 'https://images.unsplash.com/photo-1571401835393-8c5f3542294e?auto=format&fit=crop&w=800&q=80',
    count: '890+ stays',
  },
  {
    id: '3',
    name: 'Jaipur',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    count: '650+ stays',
  },
  {
    id: '4',
    name: 'Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    count: '780+ stays',
  },
];

interface HomeListing {
  id: string;
  title: string;
  category?: string;
  images?: string[];
  location_city?: string;
  location_state?: string;
  price_inr?: number;
  price_unit?: string;
  rating?: number;
  review_count?: number;
  is_featured?: number;
  tagline?: string;
  event_start?: string | null;
  event_end?: string | null;
}

const STAY_CATEGORIES = ['hotel', 'resort', 'villa', 'homestay', 'hostel', 'camp', 'apartment', 'guesthouse', 'cottage', 'private_room', 'luxury'];

function HomeListingCard({ listing }: { listing: HomeListing }) {
  const image = listing.images?.[0];
  const priceUnit = listing.price_unit || (STAY_CATEGORIES.includes(listing.category || '') ? 'night' : 'person');
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapPin className="h-10 w-10" />
          </div>
        )}
        {listing.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-xs font-medium rounded-full capitalize">
              {listing.category}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{listing.rating ? listing.rating.toFixed(1) : 'New'}</span>
          {listing.review_count ? <span className="text-xs text-slate-500">({listing.review_count})</span> : null}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {listing.location_city || 'India'}
            {listing.location_state ? `, ${listing.location_state}` : ''}
          </span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {listing.title}
        </h3>
        {listing.tagline && <p className="text-xs text-slate-500 line-clamp-1 mb-2">{listing.tagline}</p>}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-slate-900">₹{(listing.price_inr || 0).toLocaleString()}</span>
          <span className="text-sm text-slate-500">/ {priceUnit}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [apiListings, setApiListings] = useState<HomeListing[] | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventListing | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings', { params: { limit: 24 } });
        const rows = response.data?.listings;
        if (!cancelled && Array.isArray(rows)) setApiListings(rows);
      } catch (err) {
        console.error('Failed to load listings for home page:', err);
      } finally {
        if (!cancelled) setIsLoadingListings(false);
      }
    };
    fetchListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const allListings = apiListings || [];

  // EVENTS FIRST — upcoming & live events, sorted by soonest start date
  const upcomingEvents = allListings
    .filter(
      (l) =>
        l.category === 'event' &&
        l.event_start &&
        l.event_end &&
        getEventStatus(l.event_start, l.event_end) !== 'ended'
    )
    .sort((a, b) => new Date(a.event_start!).getTime() - new Date(b.event_start!).getTime());

  const normalListings = allListings.filter((l) => l.category !== 'event');
  const displayListings = normalListings;

  // FEATURED — host-marked featured stays straight from the database
  const featuredListings = allListings
    .filter((l) => l.is_featured === 1 && l.category !== 'event')
    .slice(0, 4);

  // EXPERIENCES — adventures & workshops straight from the database
  const experienceListings = allListings
    .filter((l) => l.category === 'adventure' || l.category === 'workshop')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80"
            alt="Beautiful destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find your next escape
            </h1>
            <p className="text-lg text-white/80">
              Discover unique stays, adventures, and experiences across India
            </p>
          </div>
          
          {/* Search Bar */}
          <SearchBar variant="hero" />
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular categories</h2>
              <p className="text-slate-500 mt-1">Explore by experience type</p>
            </div>
            <Link to="/search" className="text-sm font-medium text-slate-900 hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}`}
                className="group relative h-48 rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-white/70">{category.count}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Near You */}
      <section id="trending" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Trending near you</h2>
              <p className="text-slate-500 mt-1">Popular picks in your area</p>
            </div>
            <Link to="/search" className="text-sm font-medium text-slate-900 hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* EVENTS FIRST — live & upcoming events with countdown + pre-booking */}
              {upcomingEvents.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Live &amp; upcoming events
                    </span>
                    <span className="text-xs text-slate-400">Pre-book your spot before they sell out</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {upcomingEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} onPreBook={setSelectedEvent} />
                    ))}
                  </div>
                </div>
              )}

              {/* Normal listings — shown after events */}
              {displayListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayListings.map((listing) => (
                    <HomeListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No listings yet — check back soon!</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Featured Stays */}
      <section id="featured-stays" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured stays</h2>
              <p className="text-slate-500 mt-1">Handpicked accommodations</p>
            </div>
            <Link to="/search?category=homestay" className="text-sm font-medium text-slate-900 hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <HomeListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No featured stays yet — check back soon!</p>
          )}
        </div>
      </section>

      {/* Unique Experiences */}
      <section id="experiences" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Unique experiences</h2>
              <p className="text-slate-500 mt-1">Things to do beyond stays</p>
            </div>
            <Link to="/search?category=adventure" className="text-sm font-medium text-slate-900 hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : experienceListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experienceListings.map((listing) => (
                <HomeListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No experiences yet — check back soon!</p>
          )}
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Popular destinations</h2>
            <p className="text-slate-500 mt-1">Explore trending locations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                to={`/search?location=${dest.name}`}
                className="group relative h-64 rounded-2xl overflow-hidden"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-xl mb-0.5">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Host CTA */}
      <section id="host" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Share your space,<br />earn on your terms
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Turn your property into income. List your home, villa, or experience 
                and reach millions of travellers looking for unique stays.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register?role=vendor"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition-colors"
                >
                  Start hosting
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 border border-slate-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
                alt="Beautiful home"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Earn up to ₹50,000</p>
                    <p className="text-sm text-slate-500">per month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event pre-booking modal */}
      <EventPreBookModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
