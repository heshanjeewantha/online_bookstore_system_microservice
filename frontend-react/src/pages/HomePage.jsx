import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../mocks/books';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await getBooks();
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch mock books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = ['All', 'Sinhala Fiction', 'English Fiction', 'History', 'Science', 'Children'];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-20 bg-slate-50 overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* 2050 Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop" 
            alt="Futuristic Library" 
            className="w-full h-full object-cover object-center"
          />
          {/* Glassmorphic overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-50"></div>
        </div>

        {/* Animated Background Elements (now on top of the image overlay) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-brand-500/30 to-blue-500/30 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-[80px] animate-[bounce_15s_ease-in-out_infinite]" />
          
          {/* subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MCAwaC0xdjQwaDFWMHptMCAzOUgwaDF2MWg0MHYtMXoiIGZpbGw9IiNlMmU4ZjAiIGZpbGwtb3BhY2l0eT0iLjIiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/20 shadow-xl mb-8 animate-fade-in-up">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
              <span className="text-xs sm:text-sm font-black text-white tracking-[0.2em] uppercase">Welcome to the future of reading</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.05] tracking-tighter drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Unleash Imagination <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-indigo-300 to-purple-300 animate-gradient-x drop-shadow-sm">
                Beyond Boundaries
              </span>
            </h1>
            
            <p className="text-slate-200 text-lg sm:text-2xl mb-12 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in-up drop-shadow-md" style={{ animationDelay: '200ms' }}>
              Experience the next generation bookstore. Curated collections, seamless delivery, and a universe of knowledge at your fingertips.
            </p>
            
            {/* Advanced Search Bar */}
            <div className="max-w-2xl mx-auto relative group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-300 animate-gradient-x"></div>
                <div className="relative flex items-center bg-white/95 backdrop-blur-2xl border border-white/50 rounded-full p-2.5 shadow-2xl transition-all">
                  <span className="pl-5 text-2xl animate-pulse">✨</span>
                  <input 
                    type="text" 
                    placeholder="Search titles, authors, or genres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none py-4 pl-4 pr-12 text-slate-800 text-lg focus:ring-0 outline-none placeholder-slate-400 font-bold"
                  />
                  <button className="bg-slate-900 hover:bg-brand-600 text-white rounded-full px-8 py-4 font-black tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex-shrink-0">
                    Search
                  </button>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
           {[
             { icon: '🚀', title: 'Hyper-Fast Delivery', desc: 'Island-wide delivery within 24 hours using our autonomous drone delivery network.' },
             { icon: '📚', title: 'Infinite Library', desc: 'Instantly access over 10 million physical and holographic editions worldwide.' },
             { icon: '🛡️', title: 'Quantum Secure', desc: 'Your data and seamless transactions are secured by next-gen quantum encryption.' }
           ].map((feature, idx) => (
             <div key={idx} className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] p-8 hover:-translate-y-3 transition-transform duration-500 ease-out group animate-fade-in-up" style={{ animationDelay: `${400 + (idx * 100)}ms` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-white border border-slate-200 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-110 duration-500">
                  <span className="animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Book Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
           <div className="animate-fade-in-up">
             <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4 tracking-tight drop-shadow-sm">Trending Now</h2>
             <p className="text-slate-500 text-lg font-medium">Discover what the world is reading today.</p>
           </div>
           
           {/* Categories */}
           <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-black tracking-wide transition-all duration-300 ${
                    activeCategory === cat 
                      ? 'bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.3)] scale-105 border border-slate-800' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
         </div>
         
         {loading ? (
             <div className="flex justify-center py-32">
               <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
               </div>
             </div>
         ) : filteredBooks.length === 0 ? (
            <div className="text-center py-32 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up">
                <div className="text-7xl mb-6 animate-float">🛸</div>
                <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">No results found in this sector.</h3>
                <p className="text-slate-500 font-medium text-lg">Try adjusting your search parameters.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                  className="mt-8 px-8 py-4 bg-slate-900 text-white font-black tracking-wide rounded-full hover:bg-brand-600 transition-colors shadow-lg shadow-slate-900/20 hover:shadow-brand-500/30"
                >
                  Reset Filters
                </button>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredBooks.map((book, idx) => (
                  <Link 
                    key={book._id} 
                    to={`/book/${book._id}`} 
                    className="group relative flex flex-col h-full rounded-3xl bg-white overflow-hidden border border-slate-100 transition-all duration-500 hover:-translate-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] animate-fade-in-up"
                    style={{ animationDelay: `${(idx % 8) * 100}ms` }}
                  >
                     <div className="aspect-[3/4] w-full overflow-hidden relative bg-slate-100">
                         <img 
                           src={book.imageUrl} 
                           alt={book.title}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                         />
                         
                         {/* Futuristic Overlay Gradients */}
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                         {/* Tags */}
                         <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                            {book.stock <= 5 && book.stock > 0 && (
                                <div className="bg-amber-500/95 backdrop-blur-xl text-white text-[10px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-100 border border-amber-400">
                                    {book.stock} LEFT
                                </div>
                            )}
                            {book.stock === 0 && (
                                <div className="bg-red-500/95 backdrop-blur-xl text-white text-[10px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-100 border border-red-400">
                                    SOLD OUT
                                </div>
                            )}
                         </div>

                         <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xl text-slate-800 text-[10px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-slate-200">
                            {book.category}
                         </div>

                         {/* Hover Quick Actions */}
                         <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-75">
                            <span className="bg-white/95 backdrop-blur-xl text-slate-900 border border-slate-200 px-8 py-3 rounded-full font-black tracking-wide shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex items-center gap-2 hover:bg-brand-600 hover:border-brand-500 hover:text-white transition-colors">
                              <span>Explore</span>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </span>
                         </div>
                     </div>
                     <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-white">
                         <h3 className="text-slate-800 font-black text-xl leading-[1.2] mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                             {book.title}
                         </h3>
                         <p className="text-slate-500 text-sm font-bold mb-6 tracking-wide uppercase">{book.author}</p>
                         <div className="mt-auto pt-5 border-t border-slate-100/80 flex items-center justify-between">
                             <span className="text-2xl font-black text-slate-800 tracking-tight">
                               <span className="text-sm font-bold text-slate-400 mr-1.5 uppercase">Rs.</span>
                               {book.price.toLocaleString()}
                             </span>
                         </div>
                     </div>
                  </Link>
                ))}
            </div>
         )}
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
         <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.5)] group animate-fade-in-up">
            {/* Background art */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-brand-500/30 rounded-full blur-[100px] group-hover:bg-brand-500/40 transition-colors duration-1000"></div>
               <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[100px] group-hover:bg-purple-500/40 transition-colors duration-1000"></div>
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MCAwaC0xdjQwaDFWMHptMCAzOUgwaDF2MWg0MHYtMXoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA0IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+')] opacity-20 parallax mix-blend-screen" />
            </div>

            <div className="relative z-10 p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="w-full max-w-2xl text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
                    <span className="animate-pulse">✨</span>
                    <span className="text-xs font-bold text-brand-300 tracking-[0.2em] uppercase">Join The Network</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">Embrace the Future <br className="hidden lg:block"/> of Storytelling.</h2>
                  <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">Subscribe to our neural network for updates on new holocron releases and immersive literary experiences.</p>
               </div>
               <div className="w-full max-w-xl">
                  <div className="relative flex flex-col sm:flex-row items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-full p-2.5 focus-within:bg-white/10 focus-within:border-white/30 transition-all duration-300 shadow-2xl">
                    <input 
                      type="email" 
                      placeholder="Enter your neural-link ID (Email)"
                      className="w-full bg-transparent border-none py-4 px-6 text-white placeholder-slate-500 focus:ring-0 outline-none font-bold text-lg text-center sm:text-left"
                    />
                    <button className="w-full sm:w-auto mt-2 sm:mt-0 bg-white hover:bg-brand-50 text-slate-900 rounded-[1.5rem] sm:rounded-full px-8 py-4 font-black tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)] whitespace-nowrap">
                      Initialize Link
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HomePage;
