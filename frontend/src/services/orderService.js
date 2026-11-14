import api from './api';

export const orderService = {
  async createOrder(data) {
    const res = await api.post('/orders', data);
    return res.data;
  },

  async getMyOrders(params = {}) {
    const res = await api.get('/orders/my-orders', { params });
    return res.data;
  },

  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id, reason) {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  async downloadInvoice(id) {
    const res = await api.get(`/orders/${id}/invoice`, {
      responseType: 'blob'
    });
    return res.data;
  },

  // Payment
  async createPayment(data) {
    const res = await api.post('/payments/create', data);
    return res.data;
  },

  async verifyPayment(data) {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },

  // Admin orders & dashboard
  async getAdminDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getAdminOrders(params = {}) {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await api.put(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },

  async getAdminCustomers(params = {}) {
    const res = await api.get('/admin/customers', { params });
    return res.data;
  },

  async toggleCustomerStatus(customerId) {
    const res = await api.put(`/admin/customers/${customerId}/toggle-status`);
    return res.data;
  },

  async getAdminReports(period = 'monthly') {
    const res = await api.get('/admin/reports/sales', { params: { period } });
    return res.data;
  }
};

