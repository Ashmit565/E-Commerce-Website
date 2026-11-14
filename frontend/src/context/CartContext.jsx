import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState({
    items: [],
    item_count: 0,
    subtotal: 0,
    original_total: 0,
    discount_amount: 0,
    delivery_charge: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        item_count: 0,
        subtotal: 0,
        original_total: 0,
        discount_amount: 0,
        delivery_charge: 0,
        total_amount: 0
      });
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      return false;
    }
    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      toast.success('Product added to your cart!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add item to cart';
      toast.error(msg);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updatedCart = await cartService.updateQuantity(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update quantity';
      toast.error(msg);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
      toast.info('Item removed from cart.');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({
        items: [],
        item_count: 0,
        subtotal: 0,
        original_total: 0,
        discount_amount: 0,
        delivery_charge: 0,
        total_amount: 0
      });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

