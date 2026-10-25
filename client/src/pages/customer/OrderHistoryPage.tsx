import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types';
import { orderAPI } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { ShoppingBag, ArrowRight, Clock, MapPin } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    orderAPI
      .getMyOrders()
      .then((res: any) => {
        if (Array.isArray(res)) setOrders(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Order History</h1>
        <p className="text-xs text-slate-500 mt-1">
          View all your current and past food orders with TasteHub.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500">
            Browse our menu and place your first delicious order!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
          >
            <span>Browse Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = order._id || order.id || '';
            const addressStr = typeof order.deliveryAddress === 'object'
              ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
              : order.deliveryAddress;

            return (
              <div
                key={orderId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-bold text-slate-900">#{order.orderNumber}</span>
                    <Badge status={order.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{addressStr}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Pay</span>
                    <span className="text-lg font-black text-orange-600">₹{order.totalAmount}</span>
                  </div>

                  <Link
                    to={`/customer/orders/${orderId}`}
                    className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
