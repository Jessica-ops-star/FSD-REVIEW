import React from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useSocketContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'alert':
              return <Bell className="w-5 h-5 text-orange-500 animate-bounce" />;
            default:
              return <Info className="w-5 h-5 text-blue-500" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-slate-200 shadow-xl rounded-xl p-4 flex items-start space-x-3 transition-all transform translate-y-0"
          >
            <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
