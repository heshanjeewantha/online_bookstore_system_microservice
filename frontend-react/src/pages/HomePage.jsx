import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/books/BookCard';
import { getBooks } from '../services/api';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);

  useEffect(() => {
    const loadFeaturedBooks = async () => {
      try {
        const { data } = await getBooks();
        setFeaturedBooks(data.books);
      } catch (error) {
        console.error('Failed to load featured books', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBooks();
  }, []);

  useEffect(() => {
    if (featuredBooks.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBookIndex((prev) => (prev + 1) % featuredBooks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredBooks]);

  const marqueeDuration = `${Math.max(featuredBooks.length * 7, 28)}s`;

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.2),_transparent_30%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">
              Microservices Architecture — CTSE Assignment
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Your online bookstore, powered by microservices.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              PothaGedara is a cloud-native online bookstore built with a microservices architecture.
              Browse books, place orders, and track shipment — all coordinated across dedicated services
              connected via an Nginx API gateway.
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

          {/* Circular Books Slideshow */}
          <div className="relative w-full max-w-xl h-80 sm:h-96 flex items-center justify-center overflow-hidden perspective-1000 hidden md:flex">
            {loading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-white" />
            ) : featuredBooks.length > 0 ? (
              <div className="relative w-48 h-72">
                {featuredBooks.map((book, idx) => {
                  let diff = idx - currentBookIndex;
                  const total = featuredBooks.length;
                  if (diff > Math.floor(total / 2)) diff -= total;
                  if (diff < -Math.floor(total / 2)) diff += total;

                  let transformClasses = '';
                  let opacityClasses = '';
                  let zIndexClasses = '';
                  let durationClass = 'duration-1000';

                  if (diff === 0) {
                    transformClasses = 'rotate-0 scale-100';
                    opacityClasses = 'opacity-100';
                    zIndexClasses = 'z-30';
                  } else if (diff === 1) {
                    transformClasses = 'rotate-[20deg] scale-90 translate-y-2 translate-x-4';
                    opacityClasses = 'opacity-40';
                    zIndexClasses = 'z-20';
                  } else if (diff === -1) {
                    transformClasses = '-rotate-[20deg] scale-90 translate-y-2 -translate-x-4';
                    opacityClasses = 'opacity-40';
                    zIndexClasses = 'z-20';
                  } else if (diff > 1) {
                    transformClasses = 'rotate-[45deg] scale-75 translate-y-12 translate-x-12';
                    opacityClasses = 'opacity-0';
                    zIndexClasses = '-z-10';
                    durationClass = 'duration-0'; // snap without transition
                  } else if (diff < -1) {
                    transformClasses = '-rotate-[45deg] scale-75 translate-y-12 -translate-x-12';
                    opacityClasses = 'opacity-0';
                    zIndexClasses = '-z-10';
                    durationClass = 'duration-0'; // snap
                  }

                  return (
                    <div
                      key={book._id}
                      className={`absolute inset-0 origin-[50%_200%] transition-all ease-in-out ${durationClass} ${transformClasses} ${opacityClasses} ${zIndexClasses}`}
                    >
                      <div className="w-full h-full bg-slate-800 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/20 relative">
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            No Cover
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white font-bold text-sm truncate">{book.title}</p>
                          <p className="text-brand-300 text-xs truncate">{book.author}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-500 text-center">No books available for slideshow</div>
            )}
          </div>
        </div>
      </section>

      {/* Order Flow Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            How It Works
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            From browsing to delivery
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-slate-600">
            Each step in the order lifecycle is managed by a dedicated microservice, ensuring separation of concerns and scalability.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              step: '01',
              title: 'Browse & Add to Cart',
              desc: 'Explore the book catalog served by the Book Service. Add items to your cart stored locally.',
              color: 'bg-brand-50 border-brand-200 text-brand-600',
              iconColor: 'bg-brand-100',
            },
            {
              step: '02',
              title: 'Place Your Order',
              desc: 'Checkout sends your order to the Order Service with a "Pending Approval" status.',
              color: 'bg-amber-50 border-amber-200 text-amber-600',
              iconColor: 'bg-amber-100',
            },
            {
              step: '03',
              title: 'Admin Approval',
              desc: 'An admin reviews and approves the order. You\'ll see a notification badge on your Orders menu.',
              color: 'bg-blue-50 border-blue-200 text-blue-600',
              iconColor: 'bg-blue-100',
            },
            {
              step: '04',
              title: 'Shipment Tracking',
              desc: 'Admin updates shipment status (Shipped → Delivered). Track your order in real time.',
              color: 'bg-emerald-50 border-emerald-200 text-emerald-600',
              iconColor: 'bg-emerald-100',
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-[2rem] border p-6 shadow-sm ${item.color}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mb-4 ${item.iconColor}`}>
                {item.step}
              </div>
              <h3 className="text-base font-bold mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Books Marquee */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              Featured Collection
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
              Browse the catalog
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Books served live from the Book microservice.
            </p>
          </div>
          <Link to="/books" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View full catalog →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : featuredBooks.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800">No books available right now</h3>
            <p className="mt-3 text-slate-500">
              Check back soon for new additions to the catalog.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div
              className="flex w-max animate-marquee-slow"
              style={{ '--marquee-duration': marqueeDuration }}
            >
              <div className="flex shrink-0 gap-6 pr-6">
                {featuredBooks.map((book) => (
                  <BookCard key={`featured-a-${book._id}`} book={book} variant="featured" />
                ))}
              </div>
              <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
                {featuredBooks.map((book) => (
                  <BookCard key={`featured-b-${book._id}`} book={book} variant="featured" />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Tech Stack Section */}
      <section className="bg-slate-950 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
              Technology Stack
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Built with modern cloud-native tools
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Node.js & Express',
                desc: 'Lightweight REST APIs across three independent microservices.',
                badge: 'Backend',
              },
              {
                name: 'MongoDB',
                desc: 'Each service uses its own isolated MongoDB database (Database per Service pattern).',
                badge: 'Database',
              },
              {
                name: 'React + Vite',
                desc: 'Fast, component-based SPA frontend with Tailwind CSS for styling.',
                badge: 'Frontend',
              },
              {
                name: 'Nginx + Docker',
                desc: 'API gateway routing traffic to services with Docker Compose orchestration.',
                badge: 'Infrastructure',
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-300 mb-4">
                  {tech.badge}
                </span>
                <h3 className="text-white font-bold text-lg mb-2">{tech.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
