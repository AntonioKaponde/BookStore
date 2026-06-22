import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useBookStore } from '../store/useBookStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import RatingComponent from './RatingComponent';
import { ShoppingCart, Heart, BookOpen, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface BookCardProps {
  key?: string;
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist, authors } = useBookStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useNotificationStore((state) => state.showToast);

  const isFav = isInWishlist(book.id);
  const author = authors.find((a) => a.id === book.authorId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Default format logic: digital if digital only, else physical
    const defaultFormat = book.formats.includes('physical') ? 'physical' : book.formats[0];
    addItem(book, defaultFormat);
    showToast(`"${book.title}" (${defaultFormat.toUpperCase()}) added to your cart!`, 'success');
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(book.id);
    if (!isFav) {
      showToast(`Added "${book.title}" to your wishlist!`, 'success');
    } else {
      showToast(`Removed "${book.title}" from your wishlist.`, 'info');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/30"
    >
      {/* Upper Interactive Area */}
      <div className="relative">
        {/* Floating Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {book.bestSeller && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black shadow-sm uppercase">
              Bestseller
            </span>
          )}
          {book.newRelease && (
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-sm uppercase">
              New
            </span>
          )}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={handleToggleFav}
          className={`absolute top-2 right-2 z-10 rounded-full border p-2 shadow-sm backdrop-blur-md transition-all ${
            isFav
              ? 'border-rose-100 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400'
              : 'border-zinc-100 bg-white/90 text-zinc-400 hover:scale-105 active:scale-95 hover:text-rose-500 dark:bg-zinc-900 dark:border-zinc-800'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Link to Details with Book Cover */}
        <Link to={`/book/${book.id}`} className="block focus:outline-none">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
            {/* Background book glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor} opacity-90 transition-opacity duration-300 group-hover:opacity-100`} />
            
            {/* Soft Shadow Spine Lines */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-black/10 backdrop-blur-[1px] z-10 border-r border-white/5" />
            <div className="absolute top-0 bottom-0 left-2.5 w-1 bg-white/5 z-10" />

            {/* Dynamic visual placeholder cover if image loads or doesn't */}
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="absolute inset-0 h-full w-full object-cover z-0" />
            ) : (
              <div className="relative z-10 p-6 flex flex-col justify-between h-full w-full text-white text-center">
                <span className="text-[9px] font-semibold tracking-widest text-zinc-300 dark:text-zinc-200 uppercase self-center max-w-[90%] truncate">
                  {author ? author.name : book.authorId || 'Editora Mulemba'}
                </span>
                <div className="flex flex-col gap-2 items-center my-auto px-1">
                  <span className="font-serif font-bold text-sm leading-tight line-clamp-3 text-white">
                    {book.title}
                  </span>
                  <span className="h-0.5 w-8 bg-amber-400 rounded" />
                </div>
                <span className="text-[8px] font-mono text-zinc-300 self-center">
                  ISBN {book.isbn ? book.isbn.substring(4) : 'MULEMBA'}
                </span>
              </div>
            )}

            {/* Floating format indicators */}
            <div className="absolute bottom-2 right-2 z-10 flex gap-1">
              {book.formats.includes('physical') && (
                <span className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white backdrop-blur-[2px]" title="Physical Book">
                  <Layers className="h-2 w-2" /> PHY
                </span>
              )}
              {(book.formats.includes('pdf') || book.formats.includes('epub')) && (
                <span className="flex items-center gap-1 rounded bg-blue-600/60 px-1.5 py-0.5 text-[8px] font-semibold text-white backdrop-blur-[2px]" title="Digital eBook">
                  <BookOpen className="h-2 w-2" /> DIG
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Book Metadata details */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1.5 flex-wrap mb-2 text-[9px] font-mono leading-none">
            {book.condition && book.condition !== 'new' ? (
              <span className="text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 font-extrabold uppercase px-1.5 py-0.5 rounded border border-amber-200">
                Usado - {book.condition === 'used_like_new' ? 'Como Novo' : book.condition === 'used_very_good' ? 'M. Bom' : book.condition === 'used_good' ? 'Bom' : 'Aceitável'}
              </span>
            ) : (
              <span className="text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 font-extrabold uppercase px-1.5 py-0.5 rounded border border-blue-200">
                Novo
              </span>
            )}
            {book.sellerName && (
              <span className="text-zinc-400 font-bold truncate max-w-[120px]" title={book.sellerName}>
                👤 {book.sellerName}
              </span>
            )}
          </div>

          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold font-mono tracking-widest uppercase block">
            {book.id === 'book-10' || book.id === 'book-11' ? 'Ciência e Tecnologia' : 'Literatura'}
          </span>
          <Link to={`/book/${book.id}`} className="group-hover:text-blue-600 dark:group-hover:text-amber-400">
            <h3 className="mt-1 line-clamp-1 text-sm font-bold text-zinc-900 dark:text-zinc-50 transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            by {author ? author.name : book.authorId || 'Unknown Author'}
          </p>

          <div className="mt-2.5">
            <RatingComponent rating={book.rating} size="xs" reviewsCount={book.reviewsCount} />
          </div>
        </div>

        {/* Action Button & Price footer grid */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Preço</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Kz {book.price.toLocaleString('pt-AO')}
            </span>
          </div>

          {book.sellerId === user?.id ? (
            <Link
              to="/dashboard"
              state={{ defaultTab: 'seller-portal' }}
              className="flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-all cursor-pointer dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-500"
            >
              Meu Anúncio
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-blue-500/25 transition-all duration-150 hover:bg-blue-700 hover:shadow-md hover:scale-102 active:scale-98 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Comprar</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
