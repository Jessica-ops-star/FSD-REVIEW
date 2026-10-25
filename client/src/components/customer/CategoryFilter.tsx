import React from 'react';
import { Category } from '../../types';
import { Flame, Utensils, CookingPot, IceCream, Coffee, Grid, Sparkles, Soup } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('starter') || lowerName.includes('appetizer')) {
      return <Flame className="w-4 h-4 text-orange-500" />;
    } else if (lowerName.includes('south') || lowerName.includes('dosa')) {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    } else if (lowerName.includes('main')) {
      return <Utensils className="w-4 h-4 text-amber-600" />;
    } else if (lowerName.includes('biryani') || lowerName.includes('rice')) {
      return <CookingPot className="w-4 h-4 text-yellow-600" />;
    } else if (lowerName.includes('chinese') || lowerName.includes('noodle')) {
      return <Soup className="w-4 h-4 text-red-500" />;
    } else if (lowerName.includes('dessert') || lowerName.includes('sweet')) {
      return <IceCream className="w-4 h-4 text-pink-500" />;
    } else if (lowerName.includes('beverage') || lowerName.includes('drink') || lowerName.includes('tea') || lowerName.includes('coffee')) {
      return <Coffee className="w-4 h-4 text-blue-500" />;
    }
    return <Grid className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
          selectedCategory === 'all'
            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Grid className="w-4 h-4" />
        <span>All Menu Items</span>
      </button>

      {categories.map((cat) => {
        const catId = cat._id || cat.id || '';
        const isSelected = selectedCategory === catId;
        return (
          <button
            key={catId}
            onClick={() => onSelectCategory(catId)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              isSelected
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50 hover:border-orange-200'
            }`}
          >
            {getIcon(cat.name)}
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
