import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api/users': {
          target: 'http://164.92.92.45:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/users/, '/users'),
        },
        '/api/books': {
          target: 'http://137.184.229.42:5002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/books/, '/books'),
        },
        '/api/orders': {
          target: 'http://159.223.63.71:5003',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/orders/, '/orders'),
        },
        '/api/payments': {
          target: 'http://129.212.233.148:3003',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/payments/, '/payments'),
        },
      },
    },
  };
});
