import React, { useState, useEffect } from 'react';
import { User, Order } from '../../types';
import { deliveryAPI } from '../../services/api';
import { X, Bike, CheckCircle, ShieldCheck } from 'lucide-react';

interface AssignDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

export const AssignDeliveryModal: React.FC<AssignDeliveryModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      deliveryAPI.getAvailablePersonnel().then((res: any) => {
        if (Array.isArray(res)) {
          setPersonnel(res);
          if (res.length > 0) {
            setSelectedPersonId(res[0]._id || res[0].id || '');
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const orderId = order._id || order.id || '';
  const addressStr = typeof order.deliveryAddress === 'object'
    ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
    : order.deliveryAddress;

  const handleAssign = async () => {
    if (!selectedPersonId || !orderId) return;
    setLoading(true);
    try {
      await deliveryAPI.assignDelivery(orderId, selectedPersonId);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to allocate delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bike className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold">Allocate & Approve Delivery</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800">Order #{order.orderNumber}</span>
            <span className="block text-slate-500 mt-0.5">Address: {addressStr}</span>
            <span className="block font-bold text-orange-600 mt-0.5">
              ₹{order.totalAmount.toFixed(2)} ({order.items.length} items)
            </span>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Admin Allocation Workflow:</strong> Once you allocate and approve this rider, the delivery rider is notified in real time and must accept the delivery order to proceed with pickup.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Available Delivery Rider
            </label>
            {personnel.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No delivery staff registered.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {personnel.map((person) => {
                  const pId = person._id || person.id || '';
                  return (
                    <label
                      key={pId}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPersonId === pId
                          ? 'border-blue-500 bg-blue-50/60 font-semibold text-blue-900 ring-2 ring-blue-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="rider"
                          value={pId}
                          checked={selectedPersonId === pId}
                          onChange={() => setSelectedPersonId(pId)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold block">{person.name}</span>
                          <span className="text-[10px] text-slate-500">{person.phone || person.email}</span>
                        </div>
                      </div>
                      {selectedPersonId === pId && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={loading || personnel.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{loading ? 'Allocating...' : 'Allocate & Approve Delivery'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
