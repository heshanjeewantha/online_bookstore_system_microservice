import { useState, useEffect } from 'react';
import { getBooks, addBook, updateBook, deleteBook } from '../../mocks/books';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
      title: '', author: '', price: '', category: '', description: '', stock: '', imageUrl: ''
  });

  useEffect(() => {
     fetchBooks();
  }, []);

  const fetchBooks = async () => {
      setLoading(true);
      try {
          const { data } = await getBooks();
          setBooks(data);
      } finally { setLoading(false); }
  };

  const handleOpenModal = (book = null) => {
      if (book) {
          setForm(book);
          setEditingId(book._id);
      } else {
          setForm({ title: '', author: '', price: '', category: '', description: '', stock: '', imageUrl: '' });
          setEditingId(null);
      }
      setModalOpen(true);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      
      try {
          if (editingId) {
              await updateBook(editingId, payload);
          } else {
              // Add generic cover if empty
              if(!payload.imageUrl) payload.imageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop";
              await addBook(payload);
          }
          await fetchBooks();
          setModalOpen(false);
      } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
      if(window.confirm('Are you sure you want to delete this book?')) {
          await deleteBook(id);
          fetchBooks();
      }
  };

  return (
    <div className="max-w-7xl mx-auto">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
           <div>
               <h1 className="text-3xl font-bold text-slate-800 mb-1 border-l-4 border-brand-600 pl-4 -ml-4">Manage Books</h1>
               <p className="text-slate-500 text-sm">Add, edit or remove books from the catalog.</p>
           </div>
           <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
               <span className="text-xl">+</span> Add New Book
           </button>
       </div>

       {loading ? (
             <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
       ) : (
           <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                   <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                       <tr>
                           <th className="px-6 py-4">Book</th>
                           <th className="px-6 py-4">Price</th>
                           <th className="px-6 py-4">Stock</th>
                           <th className="px-6 py-4 text-center">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {books.map(book => (
                           <tr key={book._id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4 flex items-center gap-4">
                                   <img src={book.imageUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm border border-slate-200" />
                                   <div>
                                       <p className="text-slate-800 font-bold mb-0.5">{book.title}</p>
                                       <p className="text-xs text-slate-500">{book.author} | {book.category}</p>
                                   </div>
                               </td>
                               <td className="px-6 py-4 font-bold text-brand-600">Rs. {book.price.toLocaleString()}</td>
                               <td className="px-6 py-4">
                                   <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${book.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                                       {book.stock} left
                                   </span>
                               </td>
                               <td className="px-6 py-4 text-center">
                                   <button onClick={() => handleOpenModal(book)} className="text-brand-600 hover:text-brand-800 mr-4 font-bold">Edit</button>
                                   <button onClick={() => handleDelete(book._id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {/* Form Modal */}
       {modalOpen && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
                   <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                       <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Book' : 'Add New Book'}</h2>
                       <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-800 text-2xl leading-none">&times;</button>
                   </div>
                   <form onSubmit={handleSubmit} className="p-6 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                               <label className="label">Title</label>
                               <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" />
                           </div>
                           <div className="col-span-2 sm:col-span-1">
                               <label className="label">Author</label>
                               <input required type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="input-field" />
                           </div>
                           <div className="col-span-2 sm:col-span-1">
                               <label className="label">Category</label>
                               <input required type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" />
                           </div>
                           <div className="col-span-2 sm:col-span-1">
                               <label className="label">Price (Rs.)</label>
                               <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" />
                           </div>
                           <div className="col-span-2 sm:col-span-1">
                               <label className="label">Stock Quantity</label>
                               <input required type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" />
                           </div>
                           <div className="col-span-2">
                               <label className="label">Image URL <span className="text-xs text-slate-400 font-normal">(Leave blank for default)</span></label>
                               <input type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="input-field text-sm font-mono placeholder-slate-400" placeholder="https://..." />
                           </div>
                           <div className="col-span-2">
                               <label className="label">Description</label>
                               <textarea required rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none"></textarea>
                           </div>
                       </div>
                       <div className="pt-4 flex gap-3">
                           <button type="submit" className="btn-primary flex-1">{editingId ? 'Save Changes' : 'Create Book'}</button>
                           <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default ManageBooks;
