import { Link } from 'react-router-dom';
import { Star, Heart, ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import { StaysIcon, AdventuresIcon, WorkshopsIcon, EventsIcon, IconBackground } from '../../components/common/IllustratedIcons';

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

const trendingListings = [
  {
    id: '1',
    title: 'The Whispering Pines Glass Chalet',
    location: 'Shimla, Himachal Pradesh',
    price: 10830,
    rating: 5.0,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    badge: 'Guest favourite',
    amenities: ['WiFi', 'Mountain view', 'Fireplace'],
  },
  {
    id: '2',
    title: 'White-Water Rafting Adventure',
    location: 'Rishikesh, Uttarakhand',
    price: 2508,
    rating: 4.8,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80',
    badge: 'Top rated',
    amenities: ['Guide included', 'Equipment', 'Safety gear'],
  },
  {
    id: '3',
    title: 'Terracotta Pottery Workshop',
    location: 'Jaipur, Rajasthan',
    price: 1500,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    badge: 'New',
    amenities: ['Materials included', 'Take home', 'Expert guidance'],
  },
  {
    id: '4',
    title: 'Luxury Villa in Goa',
    location: 'Goa, India',
    price: 8500,
    rating: 4.9,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    badge: 'Superhost',
    amenities: ['Pool', 'Beach access', 'Private'],
  },
];

const featuredStays = [
  {
    id: '5',
    title: 'Heritage Haveli in Udaipur',
    location: 'Udaipur, Rajasthan',
    price: 12000,
    rating: 4.7,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    amenities: ['Lake view', 'Heritage', 'Rooftop'],
  },
  {
    id: '6',
    title: 'Beachside Cottage in Kerala',
    location: 'Alleppey, Kerala',
    price: 6500,
    rating: 4.8,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Beachfront', 'Kayak', 'Sunset views'],
  },
  {
    id: '7',
    title: 'Mountain View Cabin',
    location: 'Manali, Himachal Pradesh',
    price: 5500,
    rating: 4.6,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    amenities: ['Valley view', 'Bonfire', 'Trekking'],
  },
  {
    id: '8',
    title: 'Royal Palace Suite',
    location: 'Jodhpur, Rajasthan',
    price: 15000,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    amenities: ['Heritage', 'Pool', 'Spa'],
  },
];

const experiences = [
  {
    id: '9',
    title: 'Sunrise Yoga in Rishikesh',
    location: 'Rishikesh, Uttarakhand',
    price: 800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    duration: '2 hours',
  },
  {
    id: '10',
    title: 'Street Food Tour in Delhi',
    location: 'New Delhi, India',
    price: 1200,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=800&q=80',
    duration: '4 hours',
  },
  {
    id: '11',
    title: 'Photography Walk in Mumbai',
    location: 'Mumbai, Maharashtra',
    price: 1500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    duration: '3 hours',
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

export default function HomePage() {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-slate-700" />
                  </button>
                  {listing.badge && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-xs font-medium rounded-full">
                        {listing.badge}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{listing.rating}</span>
                    <span className="text-xs text-slate-500">({listing.reviews})</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.location}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {listing.amenities.slice(0, 2).map((amenity, idx) => (
                      <span key={idx} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900">₹{listing.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">/ night</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStays.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-slate-700" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{listing.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.location}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {listing.amenities.slice(0, 2).map((amenity, idx) => (
                      <span key={idx} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900">₹{listing.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">/ night</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <Link
                key={exp.id}
                to={`/listing/${exp.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-slate-700" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-xs font-medium rounded-full">
                      {exp.duration}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{exp.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {exp.location}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {exp.title}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900">₹{exp.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">/ person</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
                  to="/register"
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
    </div>
  );
}
