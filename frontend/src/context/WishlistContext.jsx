import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [wishlist, setWishlist] = useState({ items: [], item_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist({ items: [], item_count: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlist.items.some((item) => item.product_id === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to manage your wishlist.');
      return;
    }
    try {
      if (isInWishlist(productId)) {
        const updated = await cartService.removeFromWishlist(productId);
        setWishlist(updated);
        toast.info('Item removed from wishlist.');
      } else {
        const updated = await cartService.addToWishlist(productId);
        setWishlist(updated);
        toast.success('Item added to your wishlist!');
      }
    } catch (err) {
      toast.error('Could not update wishlist.');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

