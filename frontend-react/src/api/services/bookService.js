import { bookApi } from '../axiosSetup';

export const bookService = {
  // ── Public ────────────────────────────────────────────────────────────────
  getAllBooks: async (params = {}) => {
    const response = await bookApi.get('/', { params });
    return response.data;
  },

  getBookById: async (id) => {
    const response = await bookApi.get(`/${id}`);
    return response.data;
  },

  // ── Admin: Book Management ────────────────────────────────────────────────
  createBook: async (data) => {
    const response = await bookApi.post('/', data);
    return response.data;
  },

  updateBook: async (id, data) => {
    const response = await bookApi.put(`/${id}`, data);
    return response.data;
  },

  // Before deleting, the backend Book Service internally contacts Order Service
  // to check for active orders containing this book.
  deleteBook: async (id) => {
    const response = await bookApi.delete(`/${id}`);
    return response.data;
  },
};
