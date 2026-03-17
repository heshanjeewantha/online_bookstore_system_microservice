import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth endpoints
export const registerUser = (data) => API.post('/users/register', data);
export const loginUser    = (data) => API.post('/users/login', data);
export const getProfile   = ()     => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);

export default API;
