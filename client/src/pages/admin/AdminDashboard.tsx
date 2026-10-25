import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { orderAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { StatCard } from '../../components/admin/StatCard';
import { Sidebar } from '../../components/common/Sidebar';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Utensils,
  CheckCircle,
  DollarSign,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const res = await orderAPI.getAllOrders();
      if (Array.isArray(res)) {
        setOrders(res as unknown as Order[]);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();
    const handleUpdate = () => fetchDashboardData();

    socket.on('order:created', handleUpdate);
    socket.on('order:status_updated', handleUpdate);

    return () => {
      socket.off('order:created', handleUpdate);
      socket.off('order:status_updated', handleUpdate);
    };
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PLACED' || o.status === 'CONFIRMED').length;
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING').length;
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const todayRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Restaurant Operations Overview</h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized monitoring system for kitchen, orders, revenue, and delivery staff.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Orders"
            value={totalOrders}
            subtext="All time orders"
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            subtext="Placed / Confirmed"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="In Kitchen"
            value={preparingOrders}
            subtext="Cooking in progress"
            icon={Utensils}
            color="orange"
          />
          <StatCard
            title="Completed"
            value={completedOrders}
            subtext="Delivered to customer"
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${todayRevenue.toFixed(2)}`}
            subtext="Settled transactions"
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Live Orders</h2>
              <p className="text-xs text-slate-500">Real-time status synced from database</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:underline flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading live orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No orders received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Order ID</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Items</th>
                    <th className="pb-3 px-2">Total Amount</th>
                    <th className="pb-3 px-2">Payment</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Assigned Rider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 8).map((order) => {
                    const orderId = order._id || order.id || '';
                    const customerObj = typeof order.customer === 'object' ? order.customer : null;
                    const customerName = customerObj?.name || 'Customer';

                    const driverObj = typeof order.deliveryPersonnel === 'object' ? order.deliveryPersonnel : null;
                    const driverName = driverObj?.name || 'Unassigned';

                    const paymentObj = typeof order.payment === 'object' ? order.payment : null;
                    const paymentMethod = paymentObj?.method || 'SIMULATED';
                    const paymentStatus = paymentObj?.status || order.paymentStatus;

                    return (
                      <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-bold text-slate-900">#{order.orderNumber}</td>
                        <td className="py-3 px-2 font-medium text-slate-800">{customerName}</td>
                        <td className="py-3 px-2 text-slate-600">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-2 font-extrabold text-orange-600">₹{order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span className="font-semibold text-slate-700">{paymentMethod}</span>{' '}
                          <span className="text-[10px] text-emerald-600">({paymentStatus})</span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge status={order.status} />
                        </td>
                        <td className="py-3 px-2 text-slate-600 font-medium">
                          {driverName !== 'Unassigned' ? (
                            <span className="text-blue-700 font-bold">{driverName}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
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
    </div>
  );
};
