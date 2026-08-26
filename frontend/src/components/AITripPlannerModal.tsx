import React, { useState } from 'react';
import { X, Sparkles, Compass, MapPin, Calendar, Users, Send } from 'lucide-react';

interface AITripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AITripPlannerModal: React.FC<AITripPlannerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [destination, setDestination] = useState('Manali & Himachal Valley');
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState('High Thrill Adventure & Relaxation');
  const [groupSize, setGroupSize] = useState('Couple');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setItineraryResult(null);

    try {
      const res = await fetch('/api/ai/trip-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, style, groupSize }),
      });
      const data = await res.json();
      if (data.itinerary) {
        setItineraryResult(data.itinerary);
      }
    } catch (err) {
      console.error('Trip planner error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 text-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-2xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>AI Travel &amp; Experience Concierge</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-mono font-bold">
                  Gemini 3.6
                </span>
              </h2>
              <p className="text-xs text-slate-500">Curates stays, workshops, adventures &amp; events into a tailored plan.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Destination / Region</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Duration (Days)</label>
              <input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Trip Vibe / Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="High Thrill Adventure & Relaxation">High Thrill Adventure &amp; Relaxation</option>
                <option value="Artisanal Workshops & Slow Dining">Artisanal Workshops &amp; Slow Dining</option>
                <option value="Luxury Beach & Sunset Events">Luxury Beach &amp; Sunset Events</option>
                <option value="Family Friendly Nature Exploration">Family Friendly Nature Exploration</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Group Setup</label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Couple">Couple</option>
                <option value="Friends Group (4-6)">Friends Group (4-6)</option>
                <option value="Family with Kids">Family with Kids</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AI Crafting Custom Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Tailored Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result Output Box */}
          {itineraryResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-indigo-700 text-xs flex items-center gap-1.5">
                <Compass className="h-4 w-4" />
                <span>Your Personalized 33veyora Travel Plan</span>
              </h4>
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                {itineraryResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
