import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import { Navbar } from './components/common/Navbar';
import { CartDrawer } from './components/customer/CartDrawer';
import { NotificationToastContainer } from './components/common/NotificationToast';
import { ProtectedLayout } from './components/common/ProtectedLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MenuPage } from './pages/customer/MenuPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminDeliveryPage } from './pages/admin/AdminDeliveryPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';

import { KitchenDashboard } from './pages/kitchen/KitchenDashboard';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
              <Navbar />

              <div className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/menu" element={<MenuPage />} />

                  {/* Customer Protected Routes */}
                  <Route element={<ProtectedLayout allowedRoles={['CUSTOMER']} />}>
                    <Route path="/customer/orders" element={<OrderHistoryPage />} />
                    <Route path="/customer/orders/:orderId" element={<OrderTrackingPage />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/menu" element={<AdminMenuPage />} />
                    <Route path="/admin/customers" element={<AdminCustomersPage />} />
                    <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                    <Route path="/admin/deliveries" element={<AdminDeliveryPage />} />
                    <Route path="/admin/staff" element={<AdminStaffPage />} />
                  </Route>

                  {/* Kitchen Protected Routes */}
                  <Route element={<ProtectedLayout allowedRoles={['KITCHEN', 'ADMIN']} />}>
                    <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
                  </Route>

                  {/* Delivery Personnel Protected Routes */}
                  <Route element={<ProtectedLayout allowedRoles={['DELIVERY', 'ADMIN']} />}>
                    <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                  </Route>

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>

              {/* Global Overlays */}
              <CartDrawer />
              <NotificationToastContainer />
            </div>
          </Router>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
