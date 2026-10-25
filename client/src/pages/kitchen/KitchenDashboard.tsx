import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { orderAPI } from '../../services/api';
import { getSocket, joinRoom } from '../../services/socket';
import { KitchenOrderCard } from '../../components/kitchen/KitchenOrderCard';
import { ChefHat, RefreshCw, Utensils } from 'lucide-react';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PREPARING' | 'READY'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchKitchenOrders = async () => {
    try {
      const res = await orderAPI.getAllOrders('PLACED,CONFIRMED,PREPARING,READY');
      if (Array.isArray(res)) {
        setOrders(res as unknown as Order[]);
      }
    } catch (err) {
      console.error('Failed to load kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();

    joinRoom('role:kitchen');
    const socket = getSocket();

    const handleNewOrder = () => fetchKitchenOrders();
    const handleStatusUpdate = () => fetchKitchenOrders();

    socket.on('order:created', handleNewOrder);
    socket.on('order:status_updated', handleStatusUpdate);

    return () => {
      socket.off('order:created', handleNewOrder);
      socket.off('order:status_updated', handleStatusUpdate);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string, note?: string) => {
    try {
      await orderAPI.updateStatus(orderId, nextStatus, note);
      fetchKitchenOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'PREPARING') return o.status === 'PREPARING';
    if (filter === 'READY') return o.status === 'READY';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-slate-400">
              Real-time culinary order board. Accept orders, start cooking & mark meals ready.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Active ({orders.length})
            </button>
            <button
              onClick={() => setFilter('PREPARING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'PREPARING'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cooking ({orders.filter((o) => o.status === 'PREPARING').length})
            </button>
            <button
              onClick={() => setFilter('READY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'READY'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ready ({orders.filter((o) => o.status === 'READY').length})
            </button>
          </div>

          <button
            onClick={fetchKitchenOrders}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Connecting to Kitchen Server...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8 max-w-md mx-auto space-y-3">
          <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Kitchen Queue Clean!</h3>
          <p className="text-xs text-slate-500">
            No incoming cooking orders right now. New customer orders will pop up instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <KitchenOrderCard
              key={order._id || order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
