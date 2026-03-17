import { Link } from 'react-router-dom';

const BookCard = ({ book, variant = 'compact' }) => {
  if (variant === 'featured') {
    return (
      <Link
        to={`/book/${book._id}`}
        aria-label={`View details for ${book.title}`}
        className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="aspect-[3/4] overflow-hidden bg-slate-100">
          <img
            src={book.image}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <span className="sr-only">{book.title}</span>
      </Link>
    );
  }

  return (
    <Link
      to={`/book/${book._id}`}
      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={book.image}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-800 transition-colors group-hover:text-brand-600 sm:text-lg">
          {book.title}
        </h3>
        <span className="block text-lg font-bold text-brand-600 sm:text-xl">
          Rs. {Number(book.price).toLocaleString()}
        </span>
      </div>
    </Link>
  );
};

export default BookCard;
