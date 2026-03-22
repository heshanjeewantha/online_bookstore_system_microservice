import { paymentApi } from '../axiosSetup';

export const paymentService = {
  processPayment: async (paymentData) => {
    const response = await paymentApi.post('/', paymentData);
    return response.data;
  },
  
  getPaymentStatus: async (orderId) => {
    const response = await paymentApi.get(`/${orderId}`);
    return response.data;
  }
};
