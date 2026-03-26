import { userApi } from '../axiosSetup';

export const userService = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: async (credentials) => {
    const response = await userApi.post('/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('pg_token', response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await userApi.post('/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('pg_token');
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  getProfile: async () => {
    const response = await userApi.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await userApi.put('/profile', data);
    return response.data;
  },

  // ── Admin: User Management ────────────────────────────────────────────────
  // Before deleting, the backend User Service internally contacts Order Service
  // and Payment Service to check for active orders / processing payments.
  getAllUsers: async () => {
    const response = await userApi.get('/');
    return response.data;
  },

  deleteUser: async (userId) => {
    // Backend will reject if user has active orders or pending payments
    const response = await userApi.delete(`/${userId}`);
    return response.data;
  },
};

export const deleteUser = (userId) => userApi.delete(`/${userId}`);
