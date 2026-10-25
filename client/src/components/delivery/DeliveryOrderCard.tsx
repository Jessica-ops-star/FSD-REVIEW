import React from 'react';
import { Order, User } from '../../types';
import { Badge } from '../common/Badge';
import { MapPin, Phone, Bike, CheckCircle, Navigation, ShieldCheck, Clock, UserCheck, Shield } from 'lucide-react';

interface DeliveryOrderCardProps {
  order: Order;
  onUpdateDeliveryStatus: (orderId: string, nextDeliveryStatus: string) => Promise<void>;
  onAcceptDelivery: (orderId: string) => Promise<void>;
  onAllocateOrder?: (order: Order) => void;
  currentUser?: User | null;
  isAdmin?: boolean;
}

export const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({
  order,
  onUpdateDeliveryStatus,
  onAcceptDelivery,
  onAllocateOrder,
  currentUser,
  isAdmin = false,
}) => {
  const orderId = order._id || order.id || '';
  const customerObj = typeof order.customer === 'object' ? order.customer : null;
  const customerName = customerObj?.name || 'Customer';
  const customerPhone = customerObj?.phone;

  const driverObj = typeof order.deliveryPersonnel === 'object' ? order.deliveryPersonnel : null;
  const driverId = String(driverObj?._id || driverObj?.id || (typeof order.deliveryPersonnel === 'string' ? order.deliveryPersonnel : ''));
  const currentUserIdStr = String(currentUser?._id || currentUser?.id || '');
  const driverEmail = (driverObj?.email || '').toLowerCase().trim();
  const currentUserEmail = (currentUser?.email || '').toLowerCase().trim();

  // Bulletproof matching: match by ID or Email
  const isAssignedToMe = Boolean(
    (currentUserIdStr && driverId && driverId === currentUserIdStr) ||
    (driverEmail && currentUserEmail && driverEmail === currentUserEmail)
  );

  const isUnassigned = !order.deliveryPersonnel;
  const isAssignedToOther = Boolean(order.deliveryPersonnel && !isAssignedToMe);
  const driverName = driverObj?.name || (order.deliveryPersonnel ? 'Assigned Rider' : 'Unassigned');

  const deliveryObj = typeof order.delivery === 'object' ? order.delivery : null;
  const isAccepted = Boolean(
    order.deliveryAcceptance === 'ACCEPTED' || 
    order.deliveryStatus === 'ACCEPTED' ||
    deliveryObj?.isAccepted === true ||
    deliveryObj?.status === 'ACCEPTED' ||
    order.status === 'PICKED_UP' ||
    order.status === 'OUT_FOR_DELIVERY' ||
    order.status === 'DELIVERED'
  );

  const isPendingAcceptance = !isAccepted && !isUnassigned;
  const isPendingMyAcceptance = isAssignedToMe && isPendingAcceptance;
  const isAcceptedReadyForPickup = (isAssignedToMe || isAdmin) && isAccepted && order.status === 'READY';
  const isPickedUp = (isAssignedToMe || isAdmin) && order.status === 'PICKED_UP';
  const isOutForDelivery = (isAssignedToMe || isAdmin) && order.status === 'OUT_FOR_DELIVERY';
  const isDelivered = order.status === 'DELIVERED';

  const paymentObj = typeof order.payment === 'object' ? order.payment : null;
  const paymentMethod = paymentObj?.method || 'SIMULATED';
  const paymentStatus = paymentObj?.status || order.paymentStatus;

  const addressStr = typeof order.deliveryAddress === 'object'
    ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
    : order.deliveryAddress;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
        isPendingMyAcceptance
          ? 'border-blue-500 ring-4 ring-blue-500/25 shadow-lg'
          : isOutForDelivery
          ? 'border-orange-400 ring-2 ring-orange-200'
          : isPickedUp
          ? 'border-purple-400 ring-2 ring-purple-200'
          : isDelivered
          ? 'border-emerald-200 bg-emerald-50/10'
          : 'border-slate-200'
      }`}
    >
      <div>
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-wide text-orange-400">
                #{order.orderNumber}
              </span>
              <Badge status={order.status} />
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center space-x-1.5 flex-wrap">
              <span>Rider:</span>
              {isUnassigned ? (
                <span className="font-semibold text-amber-400 bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px]">
                  Unassigned (Needs Admin)
                </span>
              ) : isAssignedToMe ? (
                <span className="font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px]">
                  {isAccepted ? 'You (Accepted ✓)' : 'You (Awaiting Your Acceptance)'}
                </span>
              ) : (
                <span className="font-semibold text-slate-200">
                  {driverName} {isAccepted ? '(Accepted ✓)' : '(Pending Acceptance)'}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-white">₹{order.totalAmount.toFixed(2)}</span>
            <span
              className={`block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                paymentStatus === 'PAID' || paymentStatus === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {paymentMethod} ({paymentStatus})
            </span>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="p-4 space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Customer: {customerName}</span>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}
            </div>

            <div className="flex items-start space-x-2 text-slate-600">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>{addressStr}</span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              Order Contents ({order.items.length} items):
            </span>
            <div className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 text-xs max-h-28 overflow-y-auto">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-0.5">
                  <span>{it.name}</span>
                  <span className="font-bold text-slate-900">× {it.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
        {/* ADMIN CONTROLS: If Admin is viewing */}
        {isAdmin && (
          <div className="space-y-2">
            {isUnassigned ? (
              <button
                onClick={() => onAllocateOrder && onAllocateOrder(order)}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Allocate & Approve Rider</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAllocateOrder && onAllocateOrder(order)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer text-center"
                >
                  Reallocate Rider
                </button>
                {!isAccepted && (
                  <button
                    onClick={() => onAcceptDelivery(orderId)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer text-center"
                    title="Confirm acceptance directly as Admin"
                  >
                    Confirm Acceptance
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* DELIVERY RIDER CONTROLS (Only when not purely Admin viewing) */}
        {!isAdmin && isUnassigned && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">Awaiting Admin Allocation</span>
              <span className="text-[11px] text-amber-700">
                Restaurant Admin will allocate or approve this order to a delivery rider.
              </span>
            </div>
          </div>
        )}

        {!isAdmin && isAssignedToOther && (
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center space-x-2">
            <Bike className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-[11px]">
              Allocated to rider <strong>{driverName}</strong> {isAccepted ? '(Accepted)' : '(Pending Acceptance)'}
            </span>
          </div>
        )}

        {/* State 3: Allocated to ME by Admin, awaiting my acceptance */}
        {!isAdmin && isPendingMyAcceptance && (
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0 animate-bounce" />
              <div>
                <span className="font-bold block text-blue-800">Admin Allocated This Delivery to You!</span>
                <span className="text-[11px] text-blue-700">
                  Please review address and items, then accept to confirm dispatch.
                </span>
              </div>
            </div>

            <button
              onClick={() => onAcceptDelivery(orderId)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accept Delivery Order</span>
            </button>
          </div>
        )}

        {/* State 4: Accepted by ME, Food is READY at Kitchen */}
        {isAcceptedReadyForPickup && (
          <button
            onClick={() => onUpdateDeliveryStatus(orderId, 'PICKED_UP')}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Picked Up from Kitchen</span>
          </button>
        )}

        {/* State 5: Food Picked Up */}
        {isPickedUp && (
          <button
            onClick={() => onUpdateDeliveryStatus(orderId, 'OUT_FOR_DELIVERY')}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Mark Out for Delivery</span>
          </button>
        )}

        {/* State 6: Out for Delivery */}
        {isOutForDelivery && (
          <button
            onClick={() => onUpdateDeliveryStatus(orderId, 'DELIVERED')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Delivered to Customer</span>
          </button>
        )}

        {/* State 7: Delivered */}
        {isDelivered && (
          <div className="py-2.5 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center border border-emerald-300 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Order Successfully Delivered ✓</span>
          </div>
        )}
      </div>
    </div>
  );
};
