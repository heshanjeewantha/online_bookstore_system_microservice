import { bookApi } from '../axiosSetup';

export const bookService = {
  getAllBooks: async (params) => {
    const response = await bookApi.get('/', { params });
    return response.data;
  },
  
  getBookById: async (id) => {
    const response = await bookApi.get(`/${id}`);
    return response.data;
  }
};
