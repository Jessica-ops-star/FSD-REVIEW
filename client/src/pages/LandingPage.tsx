import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  Shield,
  ChefHat,
  Bike,
  UserCheck,
  Zap,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchDemoRole } = useAuth();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/60 via-slate-50 to-slate-50 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 text-xs font-bold px-4 py-1.5 rounded-full border border-orange-200 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Academic 3rd-Year CS Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Integrated Restaurant Management &{' '}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Ordering Platform
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A centralized operations platform solving fragmented restaurant workflows by sharing a single order record in real-time across four essential roles.
          </p>

          {/* Core Demo CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/menu"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explore Customer Menu</span>
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg flex items-center space-x-2 transition-all hover:scale-105"
            >
              <span>Sign In / Demo Accounts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Roles Workflow Cards */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              One Shared Order Record Across 4 Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Information entered once is instantly synchronized across all role dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Role 1: Customer */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-emerald-500/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">1. Customer</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Browse menu, filter by category, check real-time dish availability, place order, and track order timeline dynamically.
                </p>
              </div>
              <button
                onClick={() => switchDemoRole('CUSTOMER')}
                className="mt-6 w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
              >
                Demo as Customer →
              </button>
            </div>

            {/* Role 2: Admin */}
            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-purple-600/20">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">2. Restaurant Admin</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Overview metrics, manage food items and prices, toggle dish availability live, view revenue, and assign riders.
                </p>
              </div>
              <button
                onClick={() => switchDemoRole('ADMIN')}
                className="mt-6 w-full py-2 px-3 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-colors"
              >
                Demo as Admin →
              </button>
            </div>

            {/* Role 3: Kitchen */}
            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-amber-500/20">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">3. Kitchen Staff</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Real-time kitchen order board. Accept incoming orders, start preparation, and mark meals ready for pickup.
                </p>
              </div>
              <button
                onClick={() => switchDemoRole('KITCHEN')}
                className="mt-6 w-full py-2 px-3 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                Demo as Kitchen →
              </button>
            </div>

            {/* Role 4: Delivery */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-blue-600/20">
                  <Bike className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">4. Delivery Rider</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  View assigned ready orders, mark picked up, navigate to customer address, and mark delivered.
                </p>
              </div>
              <button
                onClick={() => switchDemoRole('DELIVERY')}
                className="mt-6 w-full py-2 px-3 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors"
              >
                Demo as Rider →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Socket.IO Real-Time Sync</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Status changes made by Kitchen or Rider immediately update the Customer tracking screen without page refresh.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Live Item Availability</h4>
                <p className="text-xs text-slate-500 mt-1">
                  When Admin toggles dish availability, unavailable items are instantly blocked from customer carts.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Simulated Safe Payments</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Simulate online UPI / Card payment and Cash on Delivery with full transaction record generation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <p>© 2026 Integrated Restaurant Management & Ordering Platform. 3rd-Year CS Academic Project.</p>
      </footer>
    </div>
  );
};
