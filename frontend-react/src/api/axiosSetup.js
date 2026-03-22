import axios from 'axios';
import { API_URLS } from './config';

// Create base instances for each microservice
export const userApi = axios.create({ baseURL: API_URLS.USER_SERVICE });
export const bookApi = axios.create({ baseURL: API_URLS.BOOK_SERVICE });
export const orderApi = axios.create({ baseURL: API_URLS.ORDER_SERVICE });
export const paymentApi = axios.create({ baseURL: API_URLS.PAYMENT_SERVICE });

// Array of all instances to attach interceptors easily
const instances = [userApi, bookApi, orderApi, paymentApi];

instances.forEach((instance) => {
  // Request interceptor to attach JWT token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('pg_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for centralized error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle Unauthorized errors (e.g., token expired)
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized access. Token might be invalid or expired.');
        // Optional: Trigger a logout or redirect to login page here
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
});

export default { userApi, bookApi, orderApi, paymentApi };
