import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  CreditCard,
  Bike,
  UserCog,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Staff Management', path: '/admin/staff', icon: UserCog },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Payment Transactions', path: '/admin/payments', icon: CreditCard },
    { name: 'Delivery Dispatch', path: '/admin/deliveries', icon: Bike },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Admin Workspace
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Central Platform v1.0</p>
        <p className="mt-0.5">3rd-Year CS Project</p>
      </div>
    </aside>
  );
};
