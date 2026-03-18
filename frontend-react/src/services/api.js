import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerUser = (data) => API.post('/users/register', data);
export const loginUser = (data) => API.post('/users/login', data);
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const getUsers = () => API.get('/users');

export const getBooks = (params = {}) => API.get('/books', { params });
export const getBookById = (id) => API.get(`/books/${id}`);
export const createBook = (data) => API.post('/books', data);
export const updateBook = (id, data) => API.put(`/books/${id}`, data);
export const deleteBook = (id) => API.delete(`/books/${id}`);

// Order Service APIs
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const getPendingPaymentCount = () => API.get('/orders/pending-payment-count');
export const getAllOrders = (params = {}) => API.get('/orders', { params });
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const approveOrder = (id, data = {}) => API.put(`/orders/${id}/approve`, data);
export const cancelOrder = (id, data = {}) => API.put(`/orders/${id}/cancel`, data);
export const updateShipmentStatus = (id, data) => API.put(`/orders/${id}/shipment`, data);
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

// Payment Service APIs
export const processPayment = (data) => API.post('/payments', data);
export const getPaymentsByUser = (userId) => API.get(`/payments/${userId}`);
export const getAllPayments = () => API.get('/payments');

export default API;
