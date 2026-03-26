import { useEffect, useState } from 'react';
import { createBook, deleteBook, getBooks, updateBook } from '../../services/api';

const defaultImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop';

const emptyForm = {
  title: '',
  author: '',
  price: '',
  category: '',
  description: '',
  stock: '',
  image: '',
};

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const { data } = await getBooks();
      setBooks(data.books);
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || 'Unable to load books.',
        success: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
    setFeedback({ error: '', success: '' });
  };

  const openEditModal = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      price: book.price,
      category: book.category,
      description: book.description,
      stock: book.stock,
      image: book.image,
    });
    setModalOpen(true);
    setFeedback({ error: '', success: '' });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ error: '', success: '' });

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image || defaultImage,
    };

    try {
      if (editingId) {
        await updateBook(editingId, payload);
      } else {
        await createBook(payload);
      }

      await fetchBooks();
      setFeedback({
        error: '',
        success: editingId ? 'Book updated successfully.' : 'Book created successfully.',
      });
      closeModal();
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Unable to save book.';
      setFeedback({ error: message, success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this book from the catalog?');
    if (!confirmed) {
      return;
    }

    setFeedback({ error: '', success: '' });

    try {
      await deleteBook(id);
      setBooks((current) => current.filter((book) => book._id !== id));
      setFeedback({ error: '', success: 'Book deleted successfully.' });
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || 'Unable to delete book.',
        success: '',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="border-l-4 border-brand-600 pl-4 text-3xl font-bold text-slate-800">
            Manage Books
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Add, update, or remove books from the catalog microservice.
          </p>
        </div>
        <button type="button" onClick={openCreateModal} className="btn-primary">
          Add New Book
        </button>
      </div>

      {feedback.error && (
        <div className="flex items-center gap-3 bg-red-50 border-2 border-red-500 text-red-900 px-6 py-4 rounded-lg mb-6 shadow-lg animate-pulse">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
          <span className="font-bold text-base">{feedback.error}</span>
        </div>
      )}
      {feedback.success && (
        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-500 text-green-900 px-6 py-4 rounded-lg mb-6 shadow-lg animate-pulse">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="font-bold text-base">{feedback.success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Book</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-16 w-12 rounded-lg border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-600">
                    Rs. {Number(book.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      book.stock <= 5
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {book.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">{book.category}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(book)}
                      className="mr-4 font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(book._id)}
                      className="font-semibold text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Update Book' : 'Add Book'}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingId ? 'Edit the selected catalog item.' : 'Create a new catalog entry.'}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="text-2xl text-slate-400 hover:text-slate-700">
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="label">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="label">Author</label>
                  <input name="author" value={form.author} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input name="category" value={form.category} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="label">Price (Rs.)</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="label">Stock</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input-field" required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Image URL</label>
                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    className="input-field"
                    placeholder={defaultImage}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    className="input-field resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Book'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
