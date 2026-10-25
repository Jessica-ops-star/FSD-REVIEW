import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { deliveryAPI } from '../../services/api';
import { getSocket, joinRoom } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { DeliveryOrderCard } from '../../components/delivery/DeliveryOrderCard';
import { AssignDeliveryModal } from '../../components/admin/AssignDeliveryModal';
import { Bike, RefreshCw, AlertCircle, CheckCircle, Package, Clock, Shield } from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESTAURANT_ADMIN';

  const fetchDeliveryOrders = async () => {
    try {
      const res = await deliveryAPI.getMyAssignments();
      if (Array.isArray(res)) {
        setOrders(res as unknown as Order[]);
      }
    } catch (err) {
      console.error('Failed to fetch delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();

    joinRoom('role:delivery');
    if (isAdmin) {
      joinRoom('role:admin');
    }
    const currentUserId = user?._id || user?.id;
    if (currentUserId) {
      joinRoom(`user:${currentUserId}`);
    }

    const socket = getSocket();
    const handleUpdate = () => fetchDeliveryOrders();

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
  }, [user, isAdmin]);

  const handleUpdateDeliveryStatus = async (orderId: string, nextStatus: string) => {
    try {
      await deliveryAPI.updateStatus(orderId, nextStatus);
      fetchDeliveryOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery status');
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    try {
      await deliveryAPI.acceptDelivery(orderId);
      fetchDeliveryOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to accept delivery order');
    }
  };

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_ACCEPT' | 'READY_PICKUP' | 'ACTIVE' | 'DELIVERED' | 'UNASSIGNED'>('ALL');

  const currentUserIdStr = String(user?._id || user?.id || '');
  const currentUserEmail = (user?.email || '').toLowerCase().trim();

  const isMe = (order: Order) => {
    if (!order.deliveryPersonnel) return false;
    const dObj = typeof order.deliveryPersonnel === 'object' ? order.deliveryPersonnel : null;
    const dId = String(dObj?._id || dObj?.id || order.deliveryPersonnel || '');
    const dEmail = (dObj?.email || '').toLowerCase().trim();
    return Boolean(
      (currentUserIdStr && dId && dId === currentUserIdStr) ||
      (currentUserEmail && dEmail && currentUserEmail === dEmail)
    );
  };

  const isAccepted = (order: Order) => {
    const deliveryObj = typeof order.delivery === 'object' ? order.delivery : null;
    return Boolean(
      order.deliveryAcceptance === 'ACCEPTED' ||
      order.deliveryStatus === 'ACCEPTED' ||
      deliveryObj?.isAccepted === true ||
      deliveryObj?.status === 'ACCEPTED' ||
      order.status === 'PICKED_UP' ||
      order.status === 'OUT_FOR_DELIVERY' ||
      order.status === 'DELIVERED'
    );
  };

  // If Admin: show metrics across all orders. If Rider: show rider's own orders.
  const pendingAcceptOrders = orders.filter((o) => (isAdmin ? !!o.deliveryPersonnel : isMe(o)) && !isAccepted(o));
  const readyPickupOrders = orders.filter((o) => (isAdmin ? true : isMe(o)) && isAccepted(o) && o.status === 'READY');
  const activeOrders = orders.filter((o) => (isAdmin ? true : isMe(o)) && (o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY'));
  const deliveredOrders = orders.filter((o) => (isAdmin ? true : isMe(o)) && o.status === 'DELIVERED');
  const unassignedOrders = orders.filter((o) => !o.deliveryPersonnel && o.status === 'READY');

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'PENDING_ACCEPT') {
      return (isAdmin ? !!order.deliveryPersonnel : isMe(order)) && !isAccepted(order);
    }
    if (activeTab === 'READY_PICKUP') {
      return (isAdmin ? true : isMe(order)) && isAccepted(order) && order.status === 'READY';
    }
    if (activeTab === 'ACTIVE') {
      return (isAdmin ? true : isMe(order)) && (order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY');
    }
    if (activeTab === 'DELIVERED') {
      return (isAdmin ? true : isMe(order)) && order.status === 'DELIVERED';
    }
    if (activeTab === 'UNASSIGNED') {
      return !order.deliveryPersonnel && order.status === 'READY';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            {isAdmin ? <Shield className="w-7 h-7 text-purple-400" /> : <Bike className="w-7 h-7 text-blue-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>{isAdmin ? 'Admin Dispatch & Delivery Control Portal' : 'Delivery Personnel Dispatch Portal'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Active User: <span className="font-semibold text-white">{user?.name}</span> ({user?.role}).{' '}
              {isAdmin
                ? 'Allocate riders to orders, approve dispatches, and monitor rider acceptance in real-time.'
                : 'Receive admin allocations, accept orders, and fulfill doorstep deliveries.'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchDeliveryOrders}
          className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center space-x-2 text-xs font-semibold"
          title="Refresh assignments"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Admin Notice Banner if Admin is viewing */}
      {isAdmin && (
        <div className="p-4 bg-purple-950/60 border border-purple-500/40 rounded-2xl flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span>
              <strong>Admin Mode Active:</strong> You can click <strong>"Allocate & Approve Rider"</strong> on any unassigned order card to assign a delivery rider. The rider will be immediately notified to accept the delivery.
            </span>
          </div>
        </div>
      )}

      {/* Urgent Rider Alert Banner if Orders Waiting for Acceptance */}
      {!isAdmin && pendingAcceptOrders.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-900/80 to-indigo-950 border-2 border-blue-500 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Action Required: {pendingAcceptOrders.length} Order(s) Allocated to You by Admin!
              </h3>
              <p className="text-xs text-blue-200">
                The restaurant admin allocated delivery order(s) for your dispatch. Please click "Accept Delivery Order" below to proceed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('PENDING_ACCEPT')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Review & Accept Orders ({pendingAcceptOrders.length})
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          Overview ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('PENDING_ACCEPT')}
          className={`px-4 py-2.5 rounded-xl transition-all relative flex items-center space-x-1.5 ${
            activeTab === 'PENDING_ACCEPT'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : pendingAcceptOrders.length > 0
              ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50 hover:bg-amber-900'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {isAdmin ? 'Allocated - Pending Acceptance' : 'Pending Your Acceptance'} ({pendingAcceptOrders.length})
          </span>
          {pendingAcceptOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('READY_PICKUP')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'READY_PICKUP'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Ready for Pickup ({readyPickupOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'ACTIVE'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Active in Transit ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERED')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'DELIVERED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Delivered ({deliveredOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('UNASSIGNED')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'UNASSIGNED'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <span>Awaiting Admin Allocation ({unassignedOrders.length})</span>
        </button>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8 max-w-md mx-auto space-y-3">
          <Bike className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No orders in this view</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'PENDING_ACCEPT'
              ? 'No orders awaiting rider acceptance.'
              : activeTab === 'UNASSIGNED'
              ? 'No unassigned ready orders in the queue.'
              : 'Orders will appear here as they are updated.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <DeliveryOrderCard
              key={order._id || order.id}
              order={order}
              onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
              onAcceptDelivery={handleAcceptDelivery}
              onAllocateOrder={(o) => setSelectedOrderForAssign(o)}
              currentUser={user}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Assign / Allocate Rider Modal if opened from Dashboard */}
      {selectedOrderForAssign && (
        <AssignDeliveryModal
          isOpen={!!selectedOrderForAssign}
          onClose={() => setSelectedOrderForAssign(null)}
          order={selectedOrderForAssign}
          onSuccess={fetchDeliveryOrders}
        />
      )}
    </div>
  );
};
