import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authAPI } from '../services/api';
import { reconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  CUSTOMER: { email: 'customer@restaurant.com', password: 'Customer@123' },
  ADMIN: { email: 'admin@restaurant.com', password: 'Admin@123' },
  RESTAURANT_ADMIN: { email: 'admin@restaurant.com', password: 'Admin@123' },
  KITCHEN: { email: 'kitchen@restaurant.com', password: 'Kitchen@123' },
  KITCHEN_STAFF: { email: 'kitchen@restaurant.com', password: 'Kitchen@123' },
  DELIVERY: { email: 'delivery@restaurant.com', password: 'Delivery@123' },
  DELIVERY_PERSONNEL: { email: 'delivery@restaurant.com', password: 'Delivery@123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    reconnectSocket();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    reconnectSocket();
  };

  const switchDemoRole = async (role: Role) => {
    setLoading(true);
    try {
      const creds = DEMO_CREDENTIALS[role];
      const res = await authAPI.login(creds);
      if (res.token && res.user) {
        login(res.token, res.user);
      }
    } catch (err: any) {
      console.error(`Failed demo login for role ${role}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        switchDemoRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
