import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'PLACED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PREPARING':
        return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
      case 'READY':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'SUCCESS':
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
