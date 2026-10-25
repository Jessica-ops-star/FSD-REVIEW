import React, { useState, useEffect } from 'react';
import { MenuItem, Category } from '../../types';
import { menuAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { MenuItemCard } from '../../components/customer/MenuItemCard';
import { CategoryFilter } from '../../components/customer/CategoryFilter';
import { DishDetailModal } from '../../components/customer/DishDetailModal';
import { Search, Utensils, ArrowUpDown, Filter, XCircle, Sparkles } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('default');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDishForDetail, setSelectedDishForDetail] = useState<MenuItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      let sortBy: string | undefined;
      let sortOrder: string | undefined;

      if (sortOption === 'price_asc') {
        sortBy = 'price';
        sortOrder = 'asc';
      } else if (sortOption === 'price_desc') {
        sortBy = 'price';
        sortOrder = 'desc';
      } else if (sortOption === 'name_asc') {
        sortBy = 'name';
        sortOrder = 'asc';
      } else if (sortOption === 'name_desc') {
        sortBy = 'name';
        sortOrder = 'desc';
      }

      const [catsRes, itemsRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getMenuItems({
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: debouncedSearch || undefined,
          availableOnly: availableOnly ? true : undefined,
          sortBy,
          sortOrder,
        }),
      ]);

      if (Array.isArray(catsRes)) setCategories(catsRes);
      if (Array.isArray(itemsRes)) setItems(itemsRes);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, [selectedCategory, debouncedSearch, availableOnly, sortOption]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const handleMenuUpdate = () => {
      fetchMenuData();
    };

    socket.on('menu:updated', handleMenuUpdate);
    socket.on('menu_updated', handleMenuUpdate);

    return () => {
      socket.off('menu:updated', handleMenuUpdate);
      socket.off('menu_updated', handleMenuUpdate);
    };
  }, [selectedCategory, debouncedSearch, availableOnly, sortOption]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setAvailableOnly(false);
    setSortOption('default');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' || searchQuery.trim() !== '' || availableOnly || sortOption !== 'default';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30 inline-block">
            Spice Garden Bistro & Dining
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Authentic Cuisine & Chef Specials
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Freshly prepared dishes with server-verified prices and real-time order tracking.
          </p>
        </div>
      </div>

      {/* Search Bar, Categories & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex-1 min-w-[280px] max-w-md">
            <Search className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. biryani, paneer, dessert)..."
              className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 mr-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Availability Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Availability Filter Toggle */}
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                availableOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Available Only</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs bg-transparent border-none focus:outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="default">Default Sorting</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 animate-pulse"
            >
              <div className="bg-slate-200 aspect-[4/3] rounded-xl w-full" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching dishes found</h3>
          <p className="text-xs text-slate-500">
            We couldn't find any items matching &quot;{debouncedSearch || selectedCategory}&quot;. Try adjusting your keywords, choosing another category, or clearing your filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <MenuItemCard
              key={item._id || item.id}
              item={item}
              onViewDetails={(dish) => setSelectedDishForDetail(dish)}
            />
          ))}
        </div>
      )}

      {/* Dish Detail Modal */}
      {selectedDishForDetail && (
        <DishDetailModal
          item={selectedDishForDetail}
          onClose={() => setSelectedDishForDetail(null)}
        />
      )}
    </div>
  );
};

export default MenuPage;
