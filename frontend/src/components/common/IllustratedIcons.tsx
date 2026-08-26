// Illustrated 3D-style icons for the website

export function StaysIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="16" y="32" width="32" height="24" rx="2" fill="#F59E0B"/>
      <polygon points="32,12 8,32 56,32" fill="#D97706"/>
      <rect x="26" y="40" width="12" height="16" rx="1" fill="#92400E"/>
      <rect x="20" y="36" width="8" height="8" rx="1" fill="#FDE68A"/>
      <rect x="36" y="36" width="8" height="8" rx="1" fill="#FDE68A"/>
      <circle cx="48" cy="24" r="6" fill="#FCD34D"/>
    </svg>
  );
}

export function AdventuresIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <polygon points="32,12 8,52 56,52" fill="#10B981"/>
      <polygon points="32,12 24,32 40,32" fill="#34D399"/>
      <polygon points="16,52 28,32 40,52" fill="#059669"/>
      <polygon points="44,52 52,38 60,52" fill="#047857"/>
      <circle cx="48" cy="18" r="6" fill="#FCD34D"/>
      <ellipse cx="20" cy="48" rx="8" ry="4" fill="#6EE7B7"/>
    </svg>
  );
}

export function WorkshopsIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <ellipse cx="32" cy="36" rx="24" ry="20" fill="#A855F7"/>
      <ellipse cx="32" cy="36" rx="20" ry="16" fill="#C084FC"/>
      <circle cx="24" cy="32" r="4" fill="#EF4444"/>
      <circle cx="36" cy="28" r="4" fill="#3B82F6"/>
      <circle cx="40" cy="38" r="4" fill="#FCD34D"/>
      <circle cx="28" cy="42" r="3" fill="#10B981"/>
      <rect x="44" y="16" width="4" height="16" rx="2" fill="#92400E"/>
    </svg>
  );
}

export function EventsIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <polygon points="32,8 24,48 40,48" fill="#F472B6"/>
      <polygon points="32,8 28,28 36,28" fill="#FBCFE8"/>
      <circle cx="20" cy="20" r="4" fill="#FCD34D"/>
      <circle cx="44" cy="16" r="3" fill="#34D399"/>
      <circle cx="48" cy="28" r="4" fill="#60A5FA"/>
      <circle cx="16" cy="32" r="3" fill="#F87171"/>
      <rect x="28" y="48" width="8" height="8" rx="1" fill="#FCD34D"/>
    </svg>
  );
}

// Background wrappers for icons
export function IconBackground({ 
  children, 
  color = "amber" 
}: { 
  children: React.ReactNode;
  color?: "amber" | "emerald" | "purple" | "pink";
}) {
  const colors = {
    amber: "bg-gradient-to-br from-amber-100 to-orange-100",
    emerald: "bg-gradient-to-br from-emerald-100 to-teal-100",
    purple: "bg-gradient-to-br from-purple-100 to-pink-100",
    pink: "bg-gradient-to-br from-pink-100 to-rose-100",
  };
  
  return (
    <div className={`w-16 h-16 ${colors[color]} rounded-2xl flex items-center justify-center`}>
      {children}
    </div>
  );
}
