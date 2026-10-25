import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color: 'orange' | 'amber' | 'emerald' | 'purple' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'orange':
        return {
          bg: 'bg-orange-500/10',
          text: 'text-orange-600',
          border: 'border-orange-100',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-600',
          border: 'border-amber-100',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-600',
          border: 'border-emerald-100',
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-600',
          border: 'border-purple-100',
        };
      case 'blue':
      default:
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-600',
          border: 'border-blue-100',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className={`bg-white rounded-2xl p-5 border ${styles.border} shadow-sm hover:shadow-md transition-all flex items-center justify-between`}>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3.5 rounded-2xl ${styles.bg} ${styles.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
