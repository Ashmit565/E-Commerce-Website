import api from './api';

export const cartService = {
  async getCart() {
    const res = await api.get('/cart');
    return res.data;
  },

  async addToCart(productId, quantity = 1) {
    const res = await api.post('/cart/items', { product_id: productId, quantity });
    return res.data;
  },

  async updateQuantity(itemId, quantity) {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeFromCart(itemId) {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await api.delete('/cart');
    return res.data;
  },

  // Wishlist
  async getWishlist() {
    const res = await api.get('/wishlist');
    return res.data;
  },

  async addToWishlist(productId) {
    const res = await api.post('/wishlist/items', { product_id: productId });
    return res.data;
  },

  async removeFromWishlist(productId) {
    const res = await api.delete(`/wishlist/items/${productId}`);
    return res.data;
  }
};

