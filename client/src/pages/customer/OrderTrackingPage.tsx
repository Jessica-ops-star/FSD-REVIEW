import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../../types';
import { orderAPI } from '../../services/api';
import { getSocket, joinOrderRoom } from '../../services/socket';
import { OrderTimeline } from '../../components/customer/OrderTimeline';
import { Badge } from '../../components/common/Badge';
import {
  Clock,
  MapPin,
  CreditCard,
  ArrowLeft,
  Bike,
  Sparkles,
  Phone,
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      const res = await orderAPI.getById(orderId);
      if (res) {
        setOrder(res as unknown as Order);
      } else {
        setError('Order not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Real-time Socket.IO listener for live order updates!
  useEffect(() => {
    if (!orderId) return;

    joinOrderRoom(orderId);
    const socket = getSocket();

    const handleStatusUpdate = (data: { order: Order }) => {
      console.log('⚡ Socket event received on OrderTrackingPage:', data);
      if (data.order) {
        setOrder(data.order);
      } else {
        fetchOrderDetails();
      }
    };

    socket.on('order:status_updated', handleStatusUpdate);

    return () => {
      socket.off('order:status_updated', handleStatusUpdate);
    };
  }, [orderId]);

  const getStatusMessage = (status?: string) => {
    switch (status) {
      case 'PLACED':
        return 'Your order has been received.';
      case 'CONFIRMED':
        return 'The restaurant has confirmed your order.';
      case 'PREPARING':
        return 'The kitchen is preparing your order.';
      case 'READY':
        return 'Your order is ready.';
      case 'PICKED_UP':
        return 'Your order has been picked up.';
      case 'OUT_FOR_DELIVERY':
        return 'Your order is on the way.';
      case 'DELIVERED':
        return 'Your order has been delivered.';
      case 'CANCELLED':
        return 'Your order was cancelled.';
      default:
        return 'Tracking order status live...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Connecting to live order tracker...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'The requested order details could not be found.'}</p>
          <Link
            to="/customer/orders"
            className="inline-flex items-center space-x-2 text-xs font-bold text-orange-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const deliveryAddressStr = typeof order.deliveryAddress === 'object'
    ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.zipCode}`
    : order.deliveryAddress;

  const instructions = typeof order.deliveryAddress === 'object' ? order.deliveryAddress.instructions : '';
  const driver = typeof order.deliveryPersonnel === 'object' ? order.deliveryPersonnel : null;
  const paymentObj = typeof order.payment === 'object' ? order.payment : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live WebSocket Sync
          </span>
        </div>
      </div>

      {/* Main Order Status Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <Badge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Amount</span>
            <span className="text-2xl font-black text-orange-600">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Dynamic Status Message Alert */}
        <div className="p-4 bg-orange-500/10 border border-orange-200 rounded-2xl flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-orange-600 flex-shrink-0 animate-spin" />
          <div>
            <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">Current Status Update</h4>
            <p className="text-sm font-semibold text-orange-800 mt-0.5">
              {getStatusMessage(order.status)}
            </p>
          </div>
        </div>

        {/* Visual Stepper Timeline */}
        <div className="pt-4">
          <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
        </div>
      </div>

      {/* Rider & Address Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>Delivery Destination</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {deliveryAddressStr}
          </p>
          {instructions && (
            <div className="text-xs text-slate-500 pt-1">
              Instructions: {instructions}
            </div>
          )}
        </div>

        {/* Delivery Rider Personnel Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Bike className="w-4 h-4 text-blue-500" />
            <span>Assigned Delivery Rider</span>
          </h3>
          {driver ? (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">
                  {driver.name}
                </span>
                <span className="text-[11px] text-blue-700 block">
                  Status: {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              {driver.phone && (
                <a
                  href={`tel:${driver.phone}`}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg flex items-center space-x-1 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
              Rider will be assigned when kitchen marks order READY.
            </div>
          )}

          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Payment ({paymentObj?.method || 'SIMULATED'}):</span>
            </span>
            <span className="font-bold text-emerald-600 uppercase">
              {paymentObj?.status || order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Order Items Summary</h3>
        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
                  {item.quantity}×
                </span>
                <span className="font-semibold text-slate-800">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
