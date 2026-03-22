import { userApi, bookApi, orderApi, paymentApi } from '../api/axiosSetup';

// User Service APIs (Base URL is already /api/users)
export const registerUser = (data) => userApi.post('/register', data);
export const loginUser = (data) => userApi.post('/login', data);
export const getProfile = () => userApi.get('/profile');
export const updateProfile = (data) => userApi.put('/profile', data);
export const getUsers = () => userApi.get('/');

// Book Service APIs (Base URL is already /api/books)
export const getBooks = (params = {}) => bookApi.get('/', { params });
export const getBookById = (id) => bookApi.get(`/${id}`);
export const createBook = (data) => bookApi.post('/', data);
export const updateBook = (id, data) => bookApi.put(`/${id}`, data);
export const deleteBook = (id) => bookApi.delete(`/${id}`);

// Order Service APIs (Base URL is already /api/orders)
export const createOrder = (data) => orderApi.post('/', data);
export const getMyOrders = () => orderApi.get('/my-orders');
export const getPendingPaymentCount = () => orderApi.get('/pending-payment-count');
export const getAllOrders = (params = {}) => orderApi.get('/', { params });
export const getOrderById = (id) => orderApi.get(`/${id}`);
export const approveOrder = (id, data = {}) => orderApi.put(`/${id}/approve`, data);
export const cancelOrder = (id, data = {}) => orderApi.put(`/${id}/cancel`, data);
export const updateShipmentStatus = (id, data) => orderApi.put(`/${id}/shipment`, data);
export const updateOrderStatus = (id, data) => orderApi.put(`/${id}/status`, data);

// Payment Service APIs (Base URL is already /api/payments)
export const processPayment = (data) => paymentApi.post('/', data);
export const getPaymentsByUser = (userId) => paymentApi.get(`/${userId}`);
export const getAllPayments = () => paymentApi.get('/');

export default {
  userApi,
  bookApi,
  orderApi,
  paymentApi
};
