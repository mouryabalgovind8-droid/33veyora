import React from 'react';
import { Home, Calendar, Mountain, Palette, Sparkles, Building, TreePine, Tent, Castle, Landmark } from 'lucide-react';
import { CategoryType } from '../types';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: { id: CategoryType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'all',
      label: 'All Experiences',
      icon: <Sparkles className="h-4 w-4" />,
      desc: 'Browse everything',
    },
    {
      id: 'hotel',
      label: 'Hotels',
      icon: <Building className="h-4 w-4" />,
      desc: 'Premium hotel stays',
    },
    {
      id: 'resort',
      label: 'Resorts',
      icon: <Castle className="h-4 w-4" />,
      desc: 'Beach & mountain resorts',
    },
    {
      id: 'villa',
      label: 'Villas',
      icon: <Home className="h-4 w-4" />,
      desc: 'Private villas & bungalows',
    },
    {
      id: 'homestay',
      label: 'Homestays',
      icon: <Landmark className="h-4 w-4" />,
      desc: 'Chalets, treehouses & stays',
    },
    {
      id: 'hostel',
      label: 'Hostels',
      icon: <Tent className="h-4 w-4" />,
      desc: 'Budget-friendly hostels',
    },
    {
      id: 'camp',
      label: 'Camps',
      icon: <TreePine className="h-4 w-4" />,
      desc: 'Camping & glamping',
    },
    {
      id: 'adventure',
      label: 'Adventures',
      icon: <Mountain className="h-4 w-4" />,
      desc: 'Rafting, treks & rappelling',
    },
    {
      id: 'workshop',
      label: 'Workshops',
      icon: <Palette className="h-4 w-4" />,
      desc: 'Pottery, cooking & crafts',
    },
    {
      id: 'event',
      label: 'Events',
      icon: <Calendar className="h-4 w-4" />,
      desc: 'Concerts, wine dinners & more',
    },
  ];

  return (
    <div className="py-6 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-slate-100/80 text-slate-700 border-slate-200/80 hover:bg-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-indigo-600'}>
                  {cat.icon}
                </span>
                <div className="flex flex-col items-start text-left">
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {cat.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
