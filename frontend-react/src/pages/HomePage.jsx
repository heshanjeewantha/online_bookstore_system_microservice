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
      <section className="relative overflow-hidden text-white bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.2),_transparent_30%)]" />
        <div className="relative flex flex-col gap-12 px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">
              Curated Reads for Every Reader
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Discover your next favorite book.
            </h1>
            <p className="max-w-2xl mt-6 text-lg leading-8 text-slate-300">
              Welcome to PothaGedara, your online bookstore for fiction, non-fiction, and academic titles.
              Browse new arrivals, place orders in minutes, and track delivery updates from your account dashboard.
            </p>
            <div className="flex flex-col gap-4 mt-8 sm:flex-row">
              <Link to="/books" className="text-center btn-primary">
                Browse Catalog
              </Link>
              <Link to="/register" className="text-white btn-secondary border-white/15 bg-white/10 hover:bg-white/15">
                Create Account
              </Link>
            </div>
          </div>

          {/* Circular Books Slideshow */}
          <div className="relative items-center justify-center hidden w-full max-w-xl overflow-hidden h-80 perspective-1000 sm:h-96 md:flex">
            {loading ? (
              <div className="w-10 h-10 border-4 rounded-full animate-spin border-brand-500 border-t-white" />
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
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-500">
                            No Cover
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-sm font-bold text-white truncate">{book.title}</p>
                          <p className="text-xs truncate text-brand-300">{book.author}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-500">No books available for slideshow</div>
            )}
          </div>
        </div>
      </section>

      {/* Order Flow Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            How It Works
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            From browsing to delivery
          </h2>
          <p className="max-w-2xl mx-auto mt-3 text-slate-600">
            Shopping is simple: find your books, place your order, and follow every step until delivery.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              step: '01',
              title: 'Browse & Add to Cart',
              desc: 'Explore a wide range of books and add your favorites to cart in one click.',
              color: 'bg-brand-50 border-brand-200 text-brand-600',
              iconColor: 'bg-brand-100',
            },
            {
              step: '02',
              title: 'Place Your Order',
              desc: 'Review your cart, confirm checkout, and place your order securely.',
              color: 'bg-amber-50 border-amber-200 text-amber-600',
              iconColor: 'bg-amber-100',
            },
            {
              step: '03',
              title: 'Admin Approval',
              desc: 'Our team reviews and confirms your order so you can proceed to payment.',
              color: 'bg-blue-50 border-blue-200 text-blue-600',
              iconColor: 'bg-blue-100',
            },
            {
              step: '04',
              title: 'Shipment Tracking',
              desc: 'Track your order status from shipped to delivered directly from your account.',
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
              <h3 className="mb-2 text-base font-bold">{item.title}</h3>
              <p className="text-sm leading-relaxed opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inter-Service Communication Section */}
      <section className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Inter-Service Communication
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            How services collaborate behind the scenes
          </h2>
          <p className="max-w-3xl mt-3 text-slate-600">
            This system uses secure service-to-service APIs to validate data, synchronize order lifecycle updates,
            and keep user, catalog, order, and payment information consistent across microservices.
          </p>

          <div className="grid gap-4 mt-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="p-5 border border-blue-200 rounded-2xl bg-blue-50">
              <p className="text-xs font-bold tracking-widest text-blue-700 uppercase">Order to User</p>
              <h3 className="mt-2 text-base font-bold text-blue-900">Fetches customer profile</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
                During checkout, order-service requests user name and email from user-service internal endpoints.
              </p>
            </div>

            <div className="p-5 border rounded-2xl border-amber-200 bg-amber-50">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-700">Order to Book</p>
              <h3 className="mt-2 text-base font-bold text-amber-900">Validates price and stock</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
                Order-service verifies live book details and confirms stock before approval.
              </p>
            </div>

            <div className="p-5 border rounded-2xl border-emerald-200 bg-emerald-50">
              <p className="text-xs font-bold tracking-widest uppercase text-emerald-700">Payment to Order</p>
              <h3 className="mt-2 text-base font-bold text-emerald-900">Confirms and marks paid</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
                Payment-service checks approved order status, then updates order-service to mark it as paid.
              </p>
            </div>

            <div className="p-5 border rounded-2xl border-violet-200 bg-violet-50">
              <p className="text-xs font-bold tracking-widest uppercase text-violet-700">Internal Security</p>
              <h3 className="mt-2 text-base font-bold text-violet-900">Protected internal APIs</h3>
              <p className="mt-2 text-sm leading-relaxed text-violet-900/80">
                Internal endpoints are restricted with x-internal-api-key so only trusted services can access them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Marquee */}
      <section className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              Featured Collection
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
              Featured books you'll love
            </h2>
            <p className="max-w-2xl mt-3 text-slate-600">
              Hand-picked titles from our catalog across popular genres.
            </p>
          </div>
          <Link to="/books" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View full catalog →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full animate-spin border-brand-600 border-t-transparent" />
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
              <div className="flex gap-6 pr-6 shrink-0">
                {featuredBooks.map((book) => (
                  <BookCard key={`featured-a-${book._id}`} book={book} variant="featured" />
                ))}
              </div>
              <div className="flex gap-6 pr-6 shrink-0" aria-hidden="true">
                {featuredBooks.map((book) => (
                  <BookCard key={`featured-b-${book._id}`} book={book} variant="featured" />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 text-white bg-slate-950">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
              Why Readers Choose Us
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              A better online bookstore experience
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Wide Book Selection',
                desc: 'Discover titles across fiction, business, technology, and academic categories.',
                badge: 'Catalog',
              },
              {
                name: 'Fast Ordering',
                desc: 'Smooth checkout flow with clear order updates and payment confirmation.',
                badge: 'Checkout',
              },
              {
                name: 'Order Tracking',
                desc: 'Monitor approval, shipment, and delivery progress from your dashboard.',
                badge: 'Tracking',
              },
              {
                name: 'Trusted Experience',
                desc: 'Simple account management, secure access, and reliable storefront performance.',
                badge: 'Service',
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className="p-6 border rounded-2xl border-white/10 bg-white/5 backdrop-blur"
              >
                <span className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-300 mb-4">
                  {tech.badge}
                </span>
                <h3 className="mb-2 text-lg font-bold text-white">{tech.name}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
