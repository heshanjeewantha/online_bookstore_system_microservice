import { orderApi } from '../axiosSetup';

export const orderService = {
  // ── Customer ──────────────────────────────────────────────────────────────
  // Backend Order Service contacts User Service (validate user) and
  // Book Service (validate book & deduct stock) before creating the order.
  createOrder: async (orderData) => {
    const response = await orderApi.post('/', orderData);
    return response.data;
  },

  getUserOrders: async () => {
    const response = await orderApi.get('/my-orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await orderApi.get(`/${id}`);
    return response.data;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  getAllOrders: async (params = {}) => {
    const response = await orderApi.get('/', { params });
    return response.data;
  },

  approveOrder: async (id, data = {}) => {
    const response = await orderApi.put(`/${id}/approve`, data);
    return response.data;
  },

  cancelOrder: async (id, data = {}) => {
    const response = await orderApi.put(`/${id}/cancel`, data);
    return response.data;
  },

  updateShipmentStatus: async (id, data) => {
    const response = await orderApi.put(`/${id}/shipment`, data);
    return response.data;
  },

  updateOrderStatus: async (id, data) => {
    const response = await orderApi.put(`/${id}/status`, data);
    return response.data;
  },

  // Dashboard helper
  getPendingPaymentCount: async () => {
    const response = await orderApi.get('/pending-payment-count');
    return response.data;
  },
};
