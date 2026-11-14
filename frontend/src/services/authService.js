import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async changePassword(data) {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  async getAddresses() {
    const res = await api.get('/addresses');
    return res.data;
  },

  async createAddress(data) {
    const res = await api.post('/addresses', data);
    return res.data;
  },

  async updateAddress(id, data) {
    const res = await api.put(`/addresses/${id}`, data);
    return res.data;
  },

  async deleteAddress(id) {
    const res = await api.delete(`/addresses/${id}`);
    return res.data;
  }
};

