import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/useBookStore';
import { Search, BookOpen, X } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const { books, authors, setSearchQuery } = useBookStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = books
      .filter((b) => {
        const author = authors.find((a) => a.id === b.authorId);
        return (
          b.title.toLowerCase().includes(lowerQuery) ||
          (author && author.name.toLowerCase().includes(lowerQuery))
        );
      })
      .slice(0, 5); // Max 5 suggestions

    setSuggestions(filtered);
  }, [query, books, authors]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
    setIsOpen(false);
    navigate('/catalog');
  };

  const handleSuggestClick = (bId: string) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/book/${bId}`);
  };

  const handleClear = () => {
    setQuery('');
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef} id="navbar-searchbar">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by title, author, category or ISBN..."
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-10 text-sm text-zinc-900 shadow-inner outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 mt-2 z-50 w-full rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 max-h-80 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 mb-1">
            Matching Suggestions
          </div>
          {suggestions.map((book) => {
            const author = authors.find((a) => a.id === book.authorId);
            return (
              <button
                key={book.id}
                onClick={() => handleSuggestClick(book.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="h-10 w-8.5 rounded object-cover flex-shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800" />
                ) : (
                  <div className={`h-10 w-8.5 rounded bg-gradient-to-br ${book.coverColor} flex-shrink-0 relative overflow-hidden flex items-center justify-center text-white font-serif font-bold text-[6px] shadow-sm`}>
                    <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-black/10" />
                    COV
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {book.title}
                  </h4>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                    by {author ? author.name : 'Unknown Author'}
                  </p>
                </div>
                <BookOpen className="h-4 w-4 text-zinc-300" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
