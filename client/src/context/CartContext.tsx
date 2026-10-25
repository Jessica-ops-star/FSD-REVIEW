import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (menuItemId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    if (user?.role === 'CUSTOMER') {
      try {
        const res: any = await cartAPI.getCart();
        setCart(res);
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    } else {
      setCart(null);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = async (menuItemId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const res: any = await cartAPI.addToCart(menuItemId, quantity);
      setCart(res);
      setIsOpen(true);
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      const res: any = await cartAPI.updateQuantity(itemId, quantity);
      setCart(res);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(true);
    try {
      const res: any = await cartAPI.removeItem(itemId);
      setCart(res);
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await cartAPI.clearCart();
      setCart({ customer: user?._id || '', items: [], cartTotal: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalAmount = cart?.cartTotal || cart?.items?.reduce((sum, item) => sum + (item.itemTotal || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        itemCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
