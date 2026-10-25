import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { UserCheck, Shield, Utensils, Bike, Sparkles } from 'lucide-react';

export const QuickRoleSwitcher: React.FC = () => {
  const { user, switchDemoRole, loading } = useAuth();
  const navigate = useNavigate();

  const roles: { role: Role; label: string; icon: any; color: string }[] = [
    { role: 'CUSTOMER', label: 'Customer', icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300' },
    { role: 'ADMIN', label: 'Admin', icon: Shield, color: 'bg-purple-500/10 text-purple-600 border-purple-300' },
    { role: 'KITCHEN', label: 'Kitchen Staff', icon: Utensils, color: 'bg-amber-500/10 text-amber-600 border-amber-300' },
    { role: 'DELIVERY', label: 'Delivery Rider', icon: Bike, color: 'bg-blue-500/10 text-blue-600 border-blue-300' },
  ];

  const handleRoleSwitch = async (role: Role) => {
    await switchDemoRole(role);
    if (role === 'ADMIN' || role === 'RESTAURANT_ADMIN') {
      navigate('/admin/deliveries');
    } else if (role === 'DELIVERY' || role === 'DELIVERY_PERSONNEL') {
      navigate('/delivery/dashboard');
    } else if (role === 'KITCHEN' || role === 'KITCHEN_STAFF') {
      navigate('/kitchen/dashboard');
    } else if (role === 'CUSTOMER') {
      navigate('/menu');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 shadow-inner border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-medium">
          <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-slate-300">Presentation Demo Bar:</span>
          {user ? (
            <span className="font-bold text-orange-400 uppercase tracking-wide">
              Active Role: {user.role} ({user.name})
            </span>
          ) : (
            <span className="text-slate-400">Not Logged In</span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-slate-400 mr-1 hidden sm:inline">1-Click Switch:</span>
          {roles.map(({ role, label, icon: Icon, color }) => {
            const isActive = user?.role === role;
            return (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                disabled={loading}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border font-medium transition-all ${
                  isActive
                    ? `${color} ring-2 ring-orange-500 scale-105 font-bold`
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
