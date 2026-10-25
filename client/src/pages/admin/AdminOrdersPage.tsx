import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { orderAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { Sidebar } from '../../components/common/Sidebar';
import { Badge } from '../../components/common/Badge';
import { AssignDeliveryModal } from '../../components/admin/AssignDeliveryModal';
import { Bike, RefreshCw, Filter, Clock, CheckCircle } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAllOrders(statusFilter !== 'ALL' ? statusFilter : undefined);
      if (Array.isArray(res)) setOrders(res as unknown as Order[]);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    const handleUpdate = () => fetchOrders();

    socket.on('order:status_updated', handleUpdate);
    socket.on('order:assigned', handleUpdate);
    socket.on('delivery:assigned', handleUpdate);
    socket.on('delivery:accepted', handleUpdate);
    socket.on('order:created', handleUpdate);

    return () => {
      socket.off('order:status_updated', handleUpdate);
      socket.off('order:assigned', handleUpdate);
      socket.off('delivery:assigned', handleUpdate);
      socket.off('delivery:accepted', handleUpdate);
      socket.off('order:created', handleUpdate);
    };
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus, `Manual override by Admin`);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">All Restaurant Orders</h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized order management with live status overrides, delivery allocation, and driver acceptance tracking.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-transparent border-none focus:outline-none font-semibold text-slate-800 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLACED">PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="PICKED_UP">PICKED UP</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <button
              onClick={fetchOrders}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No orders found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Order #</th>
                    <th className="pb-3 px-2">Customer & Phone</th>
                    <th className="pb-3 px-2">Address</th>
                    <th className="pb-3 px-2">Items</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Status & Override</th>
                    <th className="pb-3 px-2">Delivery Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const orderId = order._id || order.id || '';
                    const customerObj = typeof order.customer === 'object' ? order.customer : null;
                    const customerName = customerObj?.name || 'Customer';
                    const customerContact = customerObj?.phone || customerObj?.email || '';

                    const driverObj = typeof order.deliveryPersonnel === 'object' ? order.deliveryPersonnel : null;
                    const driverName = driverObj?.name;

                    const addressStr = typeof order.deliveryAddress === 'object'
                      ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
                      : order.deliveryAddress;

                    const deliveryObj = typeof order.delivery === 'object' ? order.delivery : null;
                    const isAccepted = 
                      order.deliveryAcceptance === 'ACCEPTED' || 
                      order.deliveryStatus === 'ACCEPTED' ||
                      deliveryObj?.isAccepted === true ||
                      deliveryObj?.status === 'ACCEPTED' ||
                      order.status === 'PICKED_UP' ||
                      order.status === 'OUT_FOR_DELIVERY' ||
                      order.status === 'DELIVERED';

                    return (
                      <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-900">#{order.orderNumber}</td>
                        <td className="py-4 px-2">
                          <span className="font-semibold text-slate-900 block">{customerName}</span>
                          <span className="text-[10px] text-slate-500">{customerContact}</span>
                        </td>
                        <td className="py-4 px-2 text-slate-600 max-w-xs truncate">{addressStr}</td>
                        <td className="py-4 px-2 text-slate-700">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </td>
                        <td className="py-4 px-2 font-extrabold text-orange-600">₹{order.totalAmount.toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <Badge status={order.status} />
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(orderId, e.target.value)}
                              className="text-[11px] p-1 rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
                            >
                              <option value="PLACED">PLACED</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY">READY</option>
                              <option value="PICKED_UP">PICKED UP</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          {driverName ? (
                            <div className="flex items-center space-x-2">
                              <div>
                                <span className="font-bold text-slate-900 block">{driverName}</span>
                                {isAccepted ? (
                                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                                    Accepted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                                    Pending Rider Acceptance
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setSelectedOrderForAssign(order)}
                                className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer ml-1"
                              >
                                Reallocate
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedOrderForAssign(order)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer transition-all"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              <span>Allocate Rider</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Assign Rider Modal */}
      {selectedOrderForAssign && (
        <AssignDeliveryModal
          isOpen={!!selectedOrderForAssign}
          onClose={() => setSelectedOrderForAssign(null)}
          order={selectedOrderForAssign}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
};
