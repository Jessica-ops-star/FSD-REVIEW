import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, FileText, RotateCcw } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { useNavigate } from 'react-router-dom';

const DEFAULT_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, clearCart, itemCount, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userAddress = user?.address?.formattedAddress || user?.address?.street || '456 Oak Street, Apt 3B, Metropolis, 560001';
  const [deliveryAddress, setDeliveryAddress] = useState(userAddress);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (!isOpen) return null;

  // Breakdown calculation
  const subtotal = Number(totalAmount.toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40; // Free delivery above ₹500
  const finalTotal = Number((subtotal + tax + deliveryFee).toFixed(2));

  const handleCheckoutClick = () => {
    if (!user) {
      closeCart();
      navigate('/login?role=customer');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={closeCart}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-bold text-slate-900">Your Food Cart</h2>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {itemCount} items
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {cart && cart.items.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) clearCart();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    title="Clear entire cart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Clear</span>
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {!cart || cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Explore our delicious dishes and add your favorites to get started.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.items.map((item: any, idx: number) => {
                      const menuItem = item.menuItem || {};
                      const itemId = menuItem._id || menuItem.id || item._id || idx.toString();
                      const name = menuItem.name || 'Dish Item';
                      const price = menuItem.price || item.priceAtAdd || 0;
                      const img = menuItem.imageUrl || DEFAULT_FOOD_IMG;

                      return (
                        <div
                          key={itemId}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <img
                              src={img}
                              alt={name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_FOOD_IMG;
                              }}
                              className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {name}
                              </h4>
                              <p className="text-xs text-orange-600 font-bold mt-0.5">
                                ₹{price} × {item.quantity} = ₹{(price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-3">
                            <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white px-1 py-0.5">
                              <button
                                onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                className="p-1 hover:text-orange-600 text-slate-500 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1.5 min-w-[1.25rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                className="p-1 hover:text-orange-600 text-slate-500 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(itemId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Address & Notes */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>Delivery Street Address *</span>
                      </label>
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter complete delivery street address, flat number, city..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Special Cooking Instructions (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. Less spicy, extra sauce, leave at door..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cart && cart.items.length > 0 && (
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-slate-700">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charge</span>
                    <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-slate-700 font-semibold'}>
                      {deliveryFee === 0 ? 'FREE (Orders > ₹500)' : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Final Amount</span>
                    <span className="text-orange-600">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
                >
                  <span>Proceed to Payment (₹{finalTotal.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          totalAmount={finalTotal}
          deliveryAddress={deliveryAddress}
          customerNotes={customerNotes}
        />
      )}
    </>
  );
};

export default CartDrawer;
