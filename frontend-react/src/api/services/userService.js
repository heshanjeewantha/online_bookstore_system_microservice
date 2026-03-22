import { userApi } from '../axiosSetup';

export const userService = {
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

  getProfile: async () => {
    const response = await userApi.get('/profile');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('pg_token');
  }
};
