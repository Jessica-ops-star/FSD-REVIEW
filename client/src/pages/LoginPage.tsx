import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { authAPI } from '../services/api';
import {
  UtensilsCrossed,
  UserCheck,
  Shield,
  ChefHat,
  Bike,
  LogIn,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

type PortalRole = 'ALL' | 'CUSTOMER' | 'ADMIN' | 'KITCHEN' | 'DELIVERY';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role')?.toUpperCase();
  const [activePortal, setActivePortal] = useState<PortalRole>(
    roleParam === 'ADMIN' || roleParam === 'RESTAURANT_ADMIN'
      ? 'ADMIN'
      : roleParam === 'KITCHEN' || roleParam === 'KITCHEN_STAFF'
      ? 'KITCHEN'
      : roleParam === 'DELIVERY' || roleParam === 'DELIVERY_PERSONNEL'
      ? 'DELIVERY'
      : roleParam === 'CUSTOMER'
      ? 'CUSTOMER'
      : 'ALL'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roleParam) {
      if (roleParam === 'ADMIN' || roleParam === 'RESTAURANT_ADMIN') setActivePortal('ADMIN');
      else if (roleParam === 'KITCHEN' || roleParam === 'KITCHEN_STAFF') setActivePortal('KITCHEN');
      else if (roleParam === 'DELIVERY' || roleParam === 'DELIVERY_PERSONNEL') setActivePortal('DELIVERY');
      else if (roleParam === 'CUSTOMER') setActivePortal('CUSTOMER');
    }
  }, [roleParam]);

  const handleSelectPortal = (portal: PortalRole) => {
    setActivePortal(portal);
    if (portal === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ role: portal.toLowerCase() });
    }
    setError('');
  };

  const redirectByRole = (role: Role) => {
    switch (role) {
      case 'ADMIN':
      case 'RESTAURANT_ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'KITCHEN':
      case 'KITCHEN_STAFF':
        navigate('/kitchen/dashboard');
        break;
      case 'DELIVERY':
      case 'DELIVERY_PERSONNEL':
        navigate('/delivery/dashboard');
        break;
      case 'CUSTOMER':
      default:
        navigate('/menu');
        break;
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login({
        email,
        password,
        expectedRole: activePortal !== 'ALL' ? activePortal : undefined,
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        redirectByRole(res.user.role);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = async (role: Role) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoRole(role);
      redirectByRole(role);
    } catch (err: any) {
      setError(err.message || `Failed to log in as ${role}`);
    } finally {
      setLoading(false);
    }
  };

  const getPortalTitle = () => {
    switch (activePortal) {
      case 'ADMIN':
        return 'Restaurant Admin Portal';
      case 'KITCHEN':
        return 'Kitchen Staff Portal';
      case 'DELIVERY':
        return 'Delivery Rider Portal';
      case 'CUSTOMER':
        return 'Customer Ordering Portal';
      default:
        return 'Central Operations Sign In';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/30">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">{getPortalTitle()}</h2>
          <p className="text-xs text-slate-500">
            {activePortal === 'ALL'
              ? 'Role-based access platform for centralized operations'
              : `Sign in with your authorized ${activePortal.replace(/_/g, ' ')} credentials`}
          </p>
        </div>

        {/* Role Portal Switcher Tabs */}
        <div className="flex items-center justify-center bg-slate-200/70 p-1 rounded-2xl text-[11px] font-bold overflow-x-auto space-x-1">
          <button
            type="button"
            onClick={() => handleSelectPortal('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activePortal === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Roles
          </button>
          <button
            type="button"
            onClick={() => handleSelectPortal('CUSTOMER')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activePortal === 'CUSTOMER' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleSelectPortal('ADMIN')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activePortal === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleSelectPortal('KITCHEN')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activePortal === 'KITCHEN' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Kitchen
          </button>
          <button
            type="button"
            onClick={() => handleSelectPortal('DELIVERY')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activePortal === 'DELIVERY' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Delivery
          </button>
        </div>

        {/* 1-Click Presentation Demo Login Box (Mandatory from Section 3) */}
        <div className="p-4 bg-orange-500/10 border border-orange-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-700">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>1-Click Presentation Demo Login</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Click any button below to instantly authenticate against actual backend accounts:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin('CUSTOMER')}
              className="p-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center space-x-2 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Customer</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin('ADMIN')}
              className="p-2.5 rounded-xl bg-white border border-purple-300 text-purple-700 font-bold text-xs flex items-center space-x-2 hover:bg-purple-50 transition-colors shadow-xs cursor-pointer"
            >
              <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">Restaurant Admin</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin('KITCHEN')}
              className="p-2.5 rounded-xl bg-white border border-amber-300 text-amber-700 font-bold text-xs flex items-center space-x-2 hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="truncate">Kitchen Staff</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin('DELIVERY')}
              className="p-2.5 rounded-xl bg-white border border-blue-300 text-blue-700 font-bold text-xs flex items-center space-x-2 hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            >
              <Bike className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">Delivery Rider</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activePortal === 'ADMIN'
                      ? 'admin@restaurant.com'
                      : activePortal === 'KITCHEN'
                      ? 'kitchen@restaurant.com'
                      : activePortal === 'DELIVERY'
                      ? 'delivery@restaurant.com'
                      : 'customer@restaurant.com'
                  }
                  className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : `Sign In as ${activePortal !== 'ALL' ? activePortal : 'User'}`}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 flex flex-col space-y-1">
            <span className="text-xs text-slate-500">Need to create an account?</span>
            <Link
              to={activePortal !== 'ALL' ? `/register?role=${activePortal.toLowerCase()}` : '/register'}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              {activePortal !== 'ALL' ? `Register for ${activePortal.replace(/_/g, ' ')}` : 'Choose Role to Register'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
