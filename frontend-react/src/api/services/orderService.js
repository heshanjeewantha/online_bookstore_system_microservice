import { orderApi } from '../axiosSetup';

export const orderService = {
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
  }
};
