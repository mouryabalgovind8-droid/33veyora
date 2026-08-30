import { useEffect, useState } from 'react';
import { CalendarClock, MapPin, Radio, Ticket, Users } from 'lucide-react';

export interface EventListing {
  id: string;
  title: string;
  tagline?: string;
  category?: string;
  images?: string[];
  location_city?: string;
  location_state?: string;
  price_inr?: number;
  price_unit?: string;
  event_start?: string | null;
  event_end?: string | null;
  max_participants?: number | null;
}

export type EventStatus = 'upcoming' | 'live' | 'ended' | 'none';

export function getEventStatus(eventStart?: string | null, eventEnd?: string | null): EventStatus {
  if (!eventStart || !eventEnd) return 'none';
  const now = Date.now();
  const start = new Date(eventStart).getTime();
  const end = new Date(eventEnd).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 'none';
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'ended';
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (d > 0 || h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`, `${s}s`);
  return parts.join(' ');
}

export function formatEventDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface EventCardProps {
  event: EventListing;
  onPreBook?: (event: EventListing) => void;
}

/**
 * Event listing card — visually distinct (rose/purple theme), with a live
 * countdown: days-until-start before the event, time-until-end while live.
 */
export default function EventCard({ event, onPreBook }: EventCardProps) {
  const [, setTick] = useState(0);

  // Tick every second so the countdown stays live
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const status = getEventStatus(event.event_start, event.event_end);
  const image =
    event.images?.[0] ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  const countdownMs =
    status === 'upcoming'
      ? new Date(event.event_start!).getTime() - Date.now()
      : status === 'live'
        ? new Date(event.event_end!).getTime() - Date.now()
        : 0;

  const countdownLabel =
    status === 'upcoming'
      ? `Starts in ${formatCountdown(countdownMs)}`
      : status === 'live'
        ? `Ends in ${formatCountdown(countdownMs)}`
        : '';

  return (
    <div className="group bg-gradient-to-br from-rose-50 via-white to-purple-50 rounded-3xl border-2 border-rose-200 overflow-hidden hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={image}
          alt={event.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* EVENT badge — distinct colour vs normal listings */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow">
            Event
          </span>
        </div>

        {/* Countdown chip: days-until-start → time-until-end (LIVE) */}
        <div className="absolute top-3 right-3">
          {status === 'live' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow animate-pulse">
              <Radio className="h-3 w-3" /> LIVE · {countdownLabel}
            </span>
          ) : status === 'upcoming' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-rose-600 shadow backdrop-blur-sm">
              <CalendarClock className="h-3.5 w-3.5" /> {countdownLabel}
            </span>
          ) : status === 'ended' ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 text-slate-200 shadow">
              Ended
            </span>
          ) : null}
        </div>

        {/* Start date chip */}
        {event.event_start && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-slate-800 shadow">
            {formatEventDate(event.event_start)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs mb-1 gap-2">
          <span className="flex items-center gap-1 font-medium text-slate-600 truncate">
            <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
            <span className="truncate">
              {event.location_city || 'TBA'}
              {event.location_state ? `, ${event.location_state}` : ''}
            </span>
          </span>
          {event.max_participants ? (
            <span className="flex items-center gap-1 text-slate-500 flex-shrink-0">
              <Users className="h-3.5 w-3.5" /> {event.max_participants}
            </span>
          ) : null}
        </div>

        <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-1">
          {event.title}
        </h3>

        {event.tagline && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{event.tagline}</p>
        )}

        {event.event_end && (
          <p className="text-[11px] text-slate-500 mb-3 mt-auto">
            <span className="font-semibold text-slate-700">Ends:</span> {formatEventDate(event.event_end)}
          </p>
        )}
      </div>

      {/* Footer price & Pre-Book CTA */}
      <div className="px-4 pb-4 pt-3 flex items-center justify-between border-t border-rose-100">
        <div>
          <span className="text-lg font-extrabold text-slate-900">
            ₹{(event.price_inr || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-normal"> / {event.price_unit || 'person'}</span>
        </div>

        {onPreBook && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreBook(event);
            }}
            disabled={status !== 'upcoming'}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1 ${
              status === 'upcoming'
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Ticket className="h-3.5 w-3.5" />
            {status === 'upcoming' ? 'Pre-Book' : status === 'live' ? 'Started' : 'Ended'}
          </button>
        )}
      </div>
    </div>
  );
}