import React from 'react';
import { OrderStatus } from '../../types';
import { Check, Clock, Utensils, Bike, CheckCircle2, AlertCircle, PackageCheck } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: { status: string; note?: string; timestamp: string }[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, statusHistory = [] }) => {
  const steps: { key: OrderStatus; label: string; description: string; icon: any }[] = [
    {
      key: 'PLACED',
      label: 'Order Placed',
      description: 'Your order has been received.',
      icon: Clock,
    },
    {
      key: 'CONFIRMED',
      label: 'Confirmed',
      description: 'Accepted by kitchen manager.',
      icon: Check,
    },
    {
      key: 'PREPARING',
      label: 'Preparing',
      description: 'The kitchen is preparing your order.',
      icon: Utensils,
    },
    {
      key: 'READY',
      label: 'Ready',
      description: 'Your order is ready.',
      icon: CheckCircle2,
    },
    {
      key: 'PICKED_UP',
      label: 'Picked Up',
      description: 'Your order has been picked up.',
      icon: PackageCheck,
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      description: 'Your order is on the way.',
      icon: Bike,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Your order has been delivered.',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'PICKED_UP':
        return 4;
      case 'OUT_FOR_DELIVERY':
        return 5;
      case 'DELIVERED':
        return 6;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-4">
        <AlertCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="text-base font-bold text-rose-900">This Order was Cancelled</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            If you have questions, please contact restaurant support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:block">
        <div className="relative flex items-center justify-between">
          {/* Progress Bar Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
            }}
          />

          {/* Stepper Nodes */}
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110 animate-pulse'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="mt-2.5 text-center max-w-[90px]">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-orange-600'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Vertical Stepper */}
      <div className="block lg:hidden space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex items-start space-x-3 relative">
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px ${
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-orange-500 text-white ring-4 ring-orange-200 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center space-x-2">
                  <h4
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-orange-600'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
