import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, ChevronDown, Shield, AlertTriangle, FileText, 
  Phone, Mail, MessageSquare, HelpCircle, 
  CreditCard, Users, Clock, CheckCircle, 
  LifeBuoy, Headphones
} from 'lucide-react';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Users className="h-5 w-5" />,
    questions: [
      { q: 'How do I create an account?', a: 'Click "Sign up" in the top right corner. You can register with your email address and create a password. Once registered, you can start browsing and booking experiences immediately.' },
      { q: 'How do I search for stays?', a: 'Use the search bar on the homepage to enter your destination, dates, and number of guests. You can also browse by category (Stays, Adventures, Workshops, Events) or explore popular destinations.' },
      { q: 'Can I save listings for later?', a: 'Yes! Click the heart icon on any listing card to add it to your Wishlist. You can view all your saved listings from the Wishlist page.' },
    ]
  },
  {
    id: 'booking',
    title: 'Booking & Payments',
    icon: <CreditCard className="h-5 w-5" />,
    questions: [
      { q: 'How do I make a booking?', a: 'Find a listing you love, select your dates and number of guests, then click "Book Now". You\'ll be taken to the payment page where you can complete your booking securely.' },
      { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and PayPal. All transactions are processed securely through our trusted payment partners.' },
      { q: 'Will I receive a confirmation?', a: 'Yes! After successful payment, you\'ll receive an email confirmation with your booking details, including the listing information, dates, and amount paid.' },
    ]
  },
  {
    id: 'hosting',
    title: 'Hosting',
    icon: <Users className="h-5 w-5" />,
    questions: [
      { q: 'How do I become a host?', a: 'Click "Become a Host" in the navigation or footer. Complete your registration as a host, submit your property details, and wait for admin approval. Once approved, your listing will be visible to guests.' },
      { q: 'How do I add a new listing?', a: 'After logging in as a host, go to your Dashboard and click "Add Listing". Fill in the details including title, description, photos, pricing, and availability.' },
      { q: 'How do I get paid?', a: 'Payments are transferred to your account after the guest completes their stay. You can track all earnings in your Host Dashboard under "Earnings".' },
    ]
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: <HelpCircle className="h-5 w-5" />,
    questions: [
      { q: 'How do I edit my profile?', a: 'Go to your Profile page by clicking your initials in the top right corner and selecting "Profile". From there, you can update your name, email, phone number, and profile photo.' },
      { q: 'How do I change my password?', a: 'Navigate to Profile → Security → Change Password. Enter your current password and new password to update it.' },
      { q: 'How do I delete my account?', a: 'Please contact our support team to request account deletion. Note that this action is irreversible and will remove all your data.' },
    ]
  },
];

export default function HelpCentrePage() {
  const location = useLocation();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [reportFormData, setReportFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Scroll to section if hash exists
  useState(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Map hash to tab
          if (location.hash === '#safety') setActiveTab('safety');
          if (location.hash === '#cancellation') setActiveTab('cancellation');
          if (location.hash === '#report') setActiveTab('report');
        }
      }, 100);
    }
  });

  const filteredFaqs = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setReportFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setReportSubmitted(false), 5000);
  };

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'safety', label: 'Safety', icon: <Shield className="h-4 w-4" /> },
    { id: 'cancellation', label: 'Cancellation', icon: <FileText className="h-4 w-4" /> },
    { id: 'report', label: 'Report', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LifeBuoy className="h-6 w-6 text-indigo-400" />
            <span className="text-indigo-400 font-medium text-sm tracking-wide uppercase">Support</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">Find answers to common questions or get in touch with our support team</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              filteredFaqs.map((category) => (
                <div key={category.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {category.questions.map((faq, idx) => {
                      const questionId = `${category.id}-${idx}`;
                      const isExpanded = expandedQuestion === questionId;
                      
                      return (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
                          <button
                            onClick={() => setExpandedQuestion(isExpanded ? null : questionId)}
                            className="w-full flex items-center justify-between p-5 text-left"
                          >
                            <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {isExpanded && (
                            <div className="px-5 pb-5 text-slate-600 border-t border-slate-100 pt-4 leading-relaxed">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <section id="safety">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Safety Information</h2>
                <p className="text-sm text-slate-500">Your safety is our top priority</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Secure Payments</h3>
                <p className="text-sm text-slate-600 leading-relaxed">All transactions are encrypted and processed through secure payment gateways. We never store your card details.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Verified Hosts</h3>
                <p className="text-sm text-slate-600 leading-relaxed">All hosts go through a verification process before their listings go live for your peace of mind.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">24/7 Support</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Our support team is available around the clock to help you with any issues during your stay.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <LifeBuoy className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Guest Protection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">If your experience doesn't match the listing, we'll work with you to make it right or provide a refund.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Safety Tips</h3>
              <ul className="space-y-3">
                {[
                  'Always communicate through our platform for your protection',
                  'Check host reviews and ratings before booking',
                  'Share your trip details with a trusted friend or family member',
                  'Verify the listing details match the actual property upon arrival',
                  'Report any safety concerns immediately to our support team'
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Cancellation Tab */}
        {activeTab === 'cancellation' && (
          <section id="cancellation">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Cancellation Policy</h2>
                <p className="text-sm text-slate-500">Understand our cancellation and refund terms</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Cancellation Timing</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        More than 48 hours before check-in
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">80% refund</span>
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        24 to 48 hours before check-in
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">50% refund</span>
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        Less than 24 hours before check-in
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">No refund</span>
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        No-show
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">No refund</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Important Notes</h3>
              <ul className="space-y-3">
                {[
                  'Refunds are processed within 5-7 business days',
                  'Service fees are non-refundable',
                  'Some hosts may offer more flexible cancellation policies',
                  'In case of extenuating circumstances, please contact support'
                ].map((note, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <HelpCircle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <section id="report">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Report a Concern</h2>
                <p className="text-sm text-slate-500">Let us know about any issues</p>
              </div>
            </div>
            
            {reportSubmitted ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Report Submitted</h3>
                <p className="text-slate-500 max-w-md mx-auto">Thank you for letting us know. Our team will review your report and get back to you within 24 hours.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <form onSubmit={handleReportSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        value={reportFormData.name}
                        onChange={(e) => setReportFormData({ ...reportFormData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={reportFormData.email}
                        onChange={(e) => setReportFormData({ ...reportFormData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                    <select
                      value={reportFormData.subject}
                      onChange={(e) => setReportFormData({ ...reportFormData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="booking">Booking Issue</option>
                      <option value="payment">Payment Problem</option>
                      <option value="listing">Listing Accuracy</option>
                      <option value="host">Host Behaviour</option>
                      <option value="guest">Guest Behaviour</option>
                      <option value="safety">Safety Concern</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                      value={reportFormData.message}
                      onChange={(e) => setReportFormData({ ...reportFormData, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                      placeholder="Please provide as much detail as possible..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors"
                  >
                    Submit Report
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        {/* Contact Section - Always visible */}
        <section className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Still need help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <Mail className="h-5 w-5 text-indigo-600 mb-3" />
              <h4 className="font-medium text-slate-900 mb-1">Email</h4>
              <p className="text-sm text-slate-500">support@33veyora.com</p>
              <p className="text-xs text-slate-400 mt-2">Response within 24 hours</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <Phone className="h-5 w-5 text-indigo-600 mb-3" />
              <h4 className="font-medium text-slate-900 mb-1">Phone</h4>
              <p className="text-sm text-slate-500">+91 1800-123-4567</p>
              <p className="text-xs text-slate-400 mt-2">Available 24/7</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <MessageSquare className="h-5 w-5 text-indigo-600 mb-3" />
              <h4 className="font-medium text-slate-900 mb-1">Live Chat</h4>
              <p className="text-sm text-slate-500">Start a conversation</p>
              <p className="text-xs text-slate-400 mt-2">Instant support</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
