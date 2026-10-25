import React, { useState, useEffect } from 'react';
import { Order, User } from '../../types';
import { orderAPI, deliveryAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { Sidebar } from '../../components/common/Sidebar';
import { AssignDeliveryModal } from '../../components/admin/AssignDeliveryModal';
import { Badge } from '../../components/common/Badge';
import { Bike, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export const AdminDeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const [orderRes, riderRes] = await Promise.all([
        orderAPI.getAllOrders(),
        deliveryAPI.getAvailablePersonnel(),
      ]);

      if (Array.isArray(orderRes)) setOrders(orderRes as unknown as Order[]);
      if (Array.isArray(riderRes)) setRiders(riderRes as unknown as User[]);
    } catch (err) {
      console.error('Failed to load delivery overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();

    const socket = getSocket();
    const handleUpdate = () => fetchDeliveryData();

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
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Delivery Dispatch Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Admin allocation and approval center. Assign orders to delivery riders and monitor rider acceptance in real time.
            </p>
          </div>

          <button
            onClick={fetchDeliveryData}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors shadow-sm cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Riders Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {riders.map((r) => {
            const rId = r._id || r.id || '';
            const riderOrders = orders.filter((o) => {
              const dId = typeof o.deliveryPersonnel === 'object' ? o.deliveryPersonnel?._id : o.deliveryPersonnel;
              return dId === rId && o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
            });

            return (
              <div
                key={rId}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                    <p className="text-[10px] text-slate-500">{r.phone || r.email}</p>
                    <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                      Active On Duty
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-700">{riderOrders.length}</span>
                  <span className="block text-[9px] text-slate-400 font-semibold uppercase">Active Orders</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Deliveries Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Orders Requiring Allocation & Dispatch</h2>
            <span className="text-xs text-slate-400">{orders.length} Total Orders</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading delivery queue...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active deliveries.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Order #</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Address</th>
                    <th className="pb-3 px-2">Kitchen Status</th>
                    <th className="pb-3 px-2">Delivery Allocation Status</th>
                    <th className="pb-3 px-2 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => {
                    const oId = o._id || o.id || '';
                    const customerObj = typeof o.customer === 'object' ? o.customer : null;
                    const customerName = customerObj?.name || 'Customer';

                    const driverObj = typeof o.deliveryPersonnel === 'object' ? o.deliveryPersonnel : null;
                    const driverName = driverObj?.name;

                    const addressStr = typeof o.deliveryAddress === 'object'
                      ? `${o.deliveryAddress.street}, ${o.deliveryAddress.city}`
                      : o.deliveryAddress;

                    const deliveryObj = typeof o.delivery === 'object' ? o.delivery : null;
                    const isAccepted = 
                      o.deliveryAcceptance === 'ACCEPTED' || 
                      o.deliveryStatus === 'ACCEPTED' ||
                      deliveryObj?.isAccepted === true ||
                      deliveryObj?.status === 'ACCEPTED' ||
                      o.status === 'PICKED_UP' ||
                      o.status === 'OUT_FOR_DELIVERY' ||
                      o.status === 'DELIVERED';

                    return (
                      <tr key={oId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-bold text-slate-900">#{o.orderNumber}</td>
                        <td className="py-3 px-2 font-medium text-slate-800">{customerName}</td>
                        <td className="py-3 px-2 text-slate-600 max-w-xs truncate">{addressStr}</td>
                        <td className="py-3 px-2">
                          <Badge status={o.status} />
                        </td>
                        <td className="py-3 px-2">
                          {!driverName ? (
                            <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Unallocated (Needs Admin)</span>
                            </span>
                          ) : !isAccepted ? (
                            <span className="inline-flex items-center space-x-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <Clock className="w-3 h-3 text-blue-500 animate-spin" />
                              <span>Allocated to {driverName} (Pending Acceptance)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Accepted by {driverName} ({o.status})</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className={`px-3 py-1.5 font-bold text-[11px] rounded-lg shadow-sm cursor-pointer transition-all ${
                              !driverName
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-slate-700 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {!driverName ? 'Allocate & Approve Rider' : 'Reallocate Rider'}
                          </button>
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

      {selectedOrder && (
        <AssignDeliveryModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onSuccess={fetchDeliveryData}
        />
      )}
    </div>
  );
};
