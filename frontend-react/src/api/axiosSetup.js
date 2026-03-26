import axios from 'axios';
import { API_URLS } from './config';

// Each instance targets the correct /api/* prefix.
// In Docker: nginx proxies /api/* → real remote service IPs.
// In local dev: Vite proxy does the same routing (see vite.config.js).
export const userApi    = axios.create({ baseURL: API_URLS.USER_SERVICE });
export const bookApi    = axios.create({ baseURL: API_URLS.BOOK_SERVICE });
export const orderApi   = axios.create({ baseURL: API_URLS.ORDER_SERVICE });
export const paymentApi = axios.create({ baseURL: API_URLS.PAYMENT_SERVICE });

const instances = [userApi, bookApi, orderApi, paymentApi];

instances.forEach((instance) => {
  // ── Request: attach JWT ───────────────────────────────────────────────────
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

  // ── Response: centralised error handling ──────────────────────────────────
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized — token may be invalid or expired.');
        // Uncomment to auto-logout:
        // localStorage.removeItem('pg_token');
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
});

export default { userApi, bookApi, orderApi, paymentApi };
