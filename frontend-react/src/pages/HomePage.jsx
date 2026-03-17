import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/books/BookCard';
import { getBooks } from '../services/api';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedBooks = async () => {
      try {
        const { data } = await getBooks();
        setFeaturedBooks(data.books.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured books', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBooks();
  }, []);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.2),_transparent_30%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">
              Microservices Bookstore
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Discover your next favorite book in one fast, modern catalog.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Browse a curated online bookstore powered by dedicated user and book
              microservices, secure JWT authentication, and an Nginx API gateway.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/books" className="btn-primary text-center">
                Browse Catalog
              </Link>
              <Link to="/register" className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15">
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-4">
            {[
              { label: 'Book Service', value: 'Catalog CRUD' },
              { label: 'User Service', value: 'JWT + Roles' },
              { label: 'Gateway', value: 'Nginx Proxy' },
              { label: 'Deployment', value: 'Docker Compose' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              Featured Collection
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
              Fresh additions from the bookstore
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              A quick look at the catalog now available through the book microservice.
            </p>
          </div>
          <Link to="/books" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View full catalog
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} variant="featured" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
