import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Lock,
  X,
  Smartphone,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  deliveryAddress: string;
  customerNotes?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  deliveryAddress,
  customerNotes,
}) => {
  const navigate = useNavigate();
  const { closeCart, refreshCart } = useCart();
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [upiId, setUpiId] = useState('customer@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        const res = await orderAPI.createOrder({
          deliveryAddress: {
            street: deliveryAddress || '456 Oak Street, Apt 3B',
            city: 'Metropolis',
            zipCode: '560001',
            instructions: customerNotes || '',
          },
          paymentMethod: method,
          notes: customerNotes,
        });

        if (res.order) {
          const createdOrderId = res.order._id || res.order.id;
          setProcessing(false);
          setSuccess(true);

          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}

          await refreshCart();

          setTimeout(() => {
            onClose();
            closeCart();
            navigate(`/customer/orders/${createdOrderId}`);
          }, 1500);
        }
      } catch (err: any) {
        setProcessing(false);
        alert(err.message || 'Payment simulation failed.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Simulated Checkout</h3>
              <p className="text-xs text-slate-400">Academic Demo Payment Gateway</p>
            </div>
          </div>
          {!processing && !success && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Central MongoDB Order Document Created (`PLACED`) & Live Socket Updates Broadcasted.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Redirecting to Live Order Tracker...</span>
              </div>
            </div>
          ) : processing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <Lock className="w-6 h-6 text-orange-600 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Processing Simulated Payment</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Contacting {method} simulation gateway for ₹{totalAmount.toFixed(2)}...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-orange-700 font-semibold block">Total Amount Payable</span>
                  <span className="text-2xl font-black text-orange-600">₹{totalAmount.toFixed(2)}</span>
                </div>
                <span className="bg-orange-200/60 text-orange-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                  Spice Garden
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('UPI')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      method === 'UPI'
                        ? 'border-orange-500 bg-orange-50/50 text-orange-700 font-bold ring-2 ring-orange-400/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Simulated UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('CARD')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      method === 'CARD'
                        ? 'border-orange-500 bg-orange-50/50 text-orange-700 font-bold ring-2 ring-orange-400/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Simulated Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('CASH')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      method === 'CASH'
                        ? 'border-orange-500 bg-orange-50/50 text-orange-700 font-bold ring-2 ring-orange-400/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Cash on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Method-specific simulated input fields */}
              {method === 'UPI' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Simulated UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-[10px] text-slate-500 italic">Pre-filled with simulated UPI test handle</p>
                </div>
              )}

              {method === 'CARD' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Simulated Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">CVV</label>
                      <input
                        type="text"
                        value="882"
                        readOnly
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'CASH' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                  <Banknote className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Pay with exact cash or UPI scanner upon delivery at your doorstep.</span>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Academic Prototype Guarantee</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Server calculates verified prices from MongoDB, creates persistent Payment record, and broadcasts real-time Socket updates.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{totalAmount.toFixed(2)} & Place Order</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
