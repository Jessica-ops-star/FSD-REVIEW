import React from 'react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { X, Plus, Check, Clock, AlertCircle, Sparkles, Leaf } from 'lucide-react';

interface DishDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const DEFAULT_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ item, onClose }) => {
  const { addToCart, cart, loading } = useCart();

  if (!item) return null;

  const itemId = item._id || item.id || '';
  const cartItem = cart?.items.find((i: any) => {
    const mId = i.menuItem?._id || i.menuItem?.id || i.menuItem;
    return mId === itemId;
  });
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (!item.isAvailable || !itemId) return;
    await addToCart(itemId, 1);
  };

  const categoryName =
    typeof item.category === 'object' && item.category !== null
      ? item.category.name
      : 'Special Dish';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Dish Photograph */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <img
            src={item.imageUrl || DEFAULT_FOOD_IMG}
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_FOOD_IMG;
            }}
            className={`w-full h-full object-cover ${!item.isAvailable ? 'grayscale contrast-75' : ''}`}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
              {categoryName}
            </span>
            {item.isVeg !== undefined && (
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                  item.isVeg ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                <Leaf className="w-3 h-3 mr-0.5" />
                <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dish Information */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{item.name}</h2>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                {item.preparationTimeMinutes && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>~{item.preparationTimeMinutes} mins prep</span>
                  </span>
                )}
                <span>•</span>
                <span className="font-semibold text-slate-700">{categoryName}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-orange-600">₹{item.price}</span>
              <span className="block text-[10px] text-slate-400 font-medium">inclusive of taxes</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description & Ingredients
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {item.isAvailable ? (
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Freshly Available</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Currently Unavailable</span>
                </span>
              )}
            </div>

            <div className="w-1/2">
              {item.isAvailable ? (
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    currentQuantity > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:scale-95'
                  }`}
                >
                  {currentQuantity > 0 ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>In Cart ({currentQuantity}) — Add +1</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Cart (₹{item.price})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Out of Stock</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
