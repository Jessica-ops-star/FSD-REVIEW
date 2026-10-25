import React from 'react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { Plus, Check, AlertCircle, Eye, Leaf } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails?: (item: MenuItem) => void;
}

const DEFAULT_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onViewDetails }) => {
  const { addToCart, cart, loading } = useCart();

  const itemId = item._id || item.id || '';
  const cartItem = cart?.items.find((i: any) => {
    const mId = i.menuItem?._id || i.menuItem?.id || i.menuItem;
    return mId === itemId;
  });
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable || !itemId) return;
    await addToCart(itemId, 1);
  };

  const categoryName =
    typeof item.category === 'object' && item.category !== null
      ? item.category.name
      : 'Special Dish';

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(item)}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer ${
        item.isAvailable
          ? 'border-slate-200 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1'
          : 'border-slate-200 bg-slate-50/70 opacity-80'
      }`}
    >
      <div>
        {/* Image & Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={item.imageUrl || DEFAULT_FOOD_IMG}
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_FOOD_IMG;
            }}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              item.isAvailable ? 'group-hover:scale-105' : 'grayscale contrast-75'
            }`}
          />
          <div className="absolute top-3 left-3 flex items-center space-x-1.5">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
              {categoryName}
            </span>
            {item.isVeg !== undefined && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center ${
                  item.isVeg ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                <Leaf className="w-2.5 h-2.5 mr-0.5" />
                {item.isVeg ? 'Veg' : 'Non-Veg'}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            {item.isAvailable ? (
              <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Available
              </span>
            ) : (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 mr-0.5 inline" />
                Currently Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
            <span className="text-base font-extrabold text-orange-600 ml-2 whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 space-y-2">
        <div className="flex items-center space-x-2">
          {item.isAvailable ? (
            <button
              onClick={handleAdd}
              disabled={loading}
              className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                currentQuantity > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:scale-95'
              }`}
            >
              {currentQuantity > 0 ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>In Cart ({currentQuantity}) +1</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center space-x-1"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              <span>Currently Unavailable</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails && onViewDetails(item);
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="View Dish Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
