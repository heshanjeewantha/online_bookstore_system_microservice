import { paymentApi } from '../axiosSetup';

export const paymentService = {
  // Backend Payment Service contacts Order Service to validate and update
  // order status before/after processing the payment.
  processPayment: async (paymentData) => {
    const response = await paymentApi.post('/', paymentData);
    return response.data;
  },

  getPaymentsByUser: async (userId) => {
    const response = await paymentApi.get(`/${userId}`);
    return response.data;
  },

  // Admin
  getAllPayments: async () => {
    const response = await paymentApi.get('/');
    return response.data;
  },

  getPaymentStatus: async (orderId) => {
    const response = await paymentApi.get(`/order/${orderId}`);
    return response.data;
  },
};
