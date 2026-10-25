import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { QuickRoleSwitcher } from './QuickRoleSwitcher';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  User,
  LogOut,
  ChefHat,
  Bike,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESTAURANT_ADMIN';
  const isKitchen = user?.role === 'KITCHEN' || user?.role === 'KITCHEN_STAFF';
  const isDelivery = user?.role === 'DELIVERY' || user?.role === 'DELIVERY_PERSONNEL';
  const isCustomer = user?.role === 'CUSTOMER';

  const getDashboardLink = () => {
    if (!user) return '/menu';
    if (isAdmin) return '/admin/dashboard';
    if (isKitchen) return '/kitchen/dashboard';
    if (isDelivery) return '/delivery/dashboard';
    return '/menu';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <QuickRoleSwitcher />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-sans">
                Spice Garden
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-orange-600 font-semibold">
                Central Operations
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/menu"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/menu'
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Browse Menu
            </Link>

            {isCustomer && (
              <Link
                to="/customer/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/customer/orders')
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Orders
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 ${
                    location.pathname === '/admin/dashboard'
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  to="/admin/menu"
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/menu'
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Manage Menu
                </Link>
                <Link
                  to="/admin/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/orders'
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  All Orders
                </Link>
                <Link
                  to="/admin/deliveries"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 ${
                    location.pathname === '/admin/deliveries'
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Bike className="w-4 h-4 text-blue-600" />
                  <span>Delivery Dispatch</span>
                </Link>
              </>
            )}

            {isKitchen && (
              <Link
                to="/kitchen/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 ${
                  location.pathname === '/kitchen/dashboard'
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>Kitchen Display System</span>
              </Link>
            )}

            {isDelivery && (
              <Link
                to="/delivery/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 ${
                  location.pathname === '/delivery/dashboard'
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-4 h-4 text-blue-600" />
                <span>Rider Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Cart Button for Customer */}
            {(!user || user.role === 'CUSTOMER') && (
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors focus:outline-none"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Buttons / Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block pr-1">
                    <span className="block text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize">
                      {user?.role.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard / Portal
                    </Link>

                    {user?.role === 'CUSTOMER' && (
                      <Link
                        to="/customer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Order History
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Browse Menu
          </Link>
          {user?.role === 'CUSTOMER' && (
            <Link
              to="/customer/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
            >
              My Orders
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
            >
              Admin Dashboard
            </Link>
          )}
          {user?.role === 'KITCHEN' && (
            <Link
              to="/kitchen/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 bg-amber-50"
            >
              Kitchen Board
            </Link>
          )}
          {user?.role === 'DELIVERY' && (
            <Link
              to="/delivery/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blue-700 bg-blue-50"
            >
              Delivery Rider Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
