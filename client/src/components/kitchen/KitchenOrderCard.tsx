import React from 'react';
import { Order } from '../../types';
import { Badge } from '../common/Badge';
import { Clock, ChefHat, Check, Utensils, MessageSquare, ShieldCheck } from 'lucide-react';

interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: string, note?: string) => Promise<void>;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onUpdateStatus }) => {
  const orderId = order._id || order.id || '';
  const isPlaced = order.status === 'PLACED';
  const isConfirmed = order.status === 'CONFIRMED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';

  const customerObj = typeof order.customer === 'object' ? order.customer : null;
  const customerName = customerObj?.name || 'Customer';

  const paymentObj = typeof order.payment === 'object' ? order.payment : null;
  const paymentMethod = paymentObj?.method || 'SIMULATED';
  const paymentStatus = paymentObj?.status || order.paymentStatus;

  const instructions = typeof order.deliveryAddress === 'object' ? order.deliveryAddress.instructions : '';

  const orderTimeFormatted = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`bg-white rounded-2xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
        isPreparing
          ? 'border-amber-400 ring-2 ring-amber-200'
          : isPlaced
          ? 'border-blue-300'
          : isReady
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border-slate-200'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-wide text-orange-400">
                #{order.orderNumber}
              </span>
              <Badge status={order.status} />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customer: <span className="font-semibold text-white">{customerName}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-slate-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{orderTimeFormatted}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                paymentStatus === 'PAID' || paymentStatus === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {paymentMethod} ({paymentStatus})
            </span>
          </div>
        </div>

        {/* Cooking Items List */}
        <div className="p-4 space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kitchen Preparation Items ({order.items.length})
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-semibold p-2 bg-slate-50 rounded-xl border border-slate-200/80"
              >
                <span className="text-slate-900 flex-1">{item.name}</span>
                <span className="bg-orange-500 text-white font-extrabold px-2.5 py-1 rounded-lg ml-2">
                  × {item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Special Instructions callout */}
          {instructions && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-start space-x-2 text-amber-900">
              <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Chef Instruction:</span>
                <span className="italic">{instructions}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kitchen Action Buttons */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        {isPlaced && (
          <button
            onClick={() => onUpdateStatus(orderId, 'CONFIRMED', 'Kitchen accepted order')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept Order</span>
          </button>
        )}

        {isConfirmed && (
          <button
            onClick={() => onUpdateStatus(orderId, 'PREPARING', 'Kitchen started cooking')}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all animate-pulse cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Preparing</span>
          </button>
        )}

        {isPreparing && (
          <button
            onClick={() => onUpdateStatus(orderId, 'READY', 'Kitchen marked order ready')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>Mark Ready for Pickup</span>
          </button>
        )}

        {isReady && (
          <div className="py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center border border-emerald-300 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready — Waiting for Rider Pickup</span>
          </div>
        )}
      </div>
    </div>
  );
};
