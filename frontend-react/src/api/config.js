// frontend-react/src/api/config.js

// By default it uses local paths for development (which uses Vite Proxy)
// In production, it will use the absolute URLs provided in Vercel/Environment variables.
const isProd = import.meta.env.PROD;

export const API_URLS = {
  USER_SERVICE: isProd ? import.meta.env.VITE_USER_SERVICE_URL : "/api/users",
  BOOK_SERVICE: isProd ? import.meta.env.VITE_BOOK_SERVICE_URL : "/api/books",
  ORDER_SERVICE: isProd ? import.meta.env.VITE_ORDER_SERVICE_URL : "/api/orders",
  PAYMENT_SERVICE: isProd ? import.meta.env.VITE_PAYMENT_SERVICE_URL : "/api/payments",
};
