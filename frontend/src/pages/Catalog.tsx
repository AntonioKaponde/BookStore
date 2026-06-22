import React, { useState } from 'react';
import { useBookStore } from '../store/useBookStore';
import BookCard from '../components/BookCard';
import CategoryCard from '../components/CategoryCard';
import Pagination from '../components/Pagination';
import RatingComponent from '../components/RatingComponent';
import EmptyState from '../components/EmptyState';
import {
  SlidersHorizontal,
  X,
  Search,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';

export default function Catalog() {
  const {
    books,
    categories,
    authors,
    
    // Filters State
    searchQuery,
    selectedCategoryId,
    selectedAuthorId,
    selectedType,
    priceRange,
    minRating,
    sortBy,
    currentPage,
    itemsPerPage,

    // Filter Setters
    setSearchQuery,
    setSelectedCategoryId,
    setSelectedAuthorId,
    setSelectedType,
    setPriceRange,
    setMinRating,
    setSortBy,
    setCurrentPage,
    resetFilters,
  } = useBookStore();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Filter calculation logic
  const filteredBooks = books.filter((book) => {
    // 1. Search Query
    const matchedSearch =
      !searchQuery.trim() ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category
    const matchedCategory = !selectedCategoryId || book.categoryId === selectedCategoryId;

    // 3. Author
    const matchedAuthor = !selectedAuthorId || book.authorId === selectedAuthorId;

    // 4. Book Type
    let matchedType = true;
    if (selectedType === 'physical') {
      matchedType = book.formats.includes('physical');
    } else if (selectedType === 'digital') {
      matchedType = book.formats.includes('pdf') || book.formats.includes('epub');
    }

    // 5. Price Limit Removed completely
    const matchedPrice = true;

    // 6. Rating
    const matchedRating = book.rating >= minRating;

    return matchedSearch && matchedCategory && matchedAuthor && matchedType && matchedPrice && matchedRating;
  });

  // Sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      default:
        // Featured
        return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
    }
  });

  // Calculate paginated index range
  const totalItems = sortedBooks.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceChange = (index: 0 | 1, val: number) => {
    // Deprecated: No price limits
  };

  const FiltersContent = () => (
    <div className="space-y-6" id="catalog-sidebar-filters">
      {/* Search text input */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Pesquisar
        </h4>
        <div className="relative mt-2.5 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar títulos, descrição..."
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 pl-9 pr-8 text-xs text-zinc-900 outline-none focus:border-blue-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Book categories selection */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Categoria do Produto
        </h4>
        <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          <button
            onClick={() => setSelectedCategoryId('')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
              !selectedCategoryId
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            Todos os Gêneros
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                selectedCategoryId === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Book Type: physical digital both */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Formato do Livro
        </h4>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {['all', 'physical', 'digital'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`rounded-xl py-1.5 text-xs font-semibold ${
                selectedType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-290 hover:bg-zinc-200'
              }`}
            >
              {type === 'all' ? 'Todos' : type === 'physical' ? 'Físico' : 'Digital'}
            </button>
          ))}
        </div>
      </div>

      {/* Author Filter select */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Por Autor
        </h4>
        <select
          value={selectedAuthorId}
          onChange={(e) => setSelectedAuthorId(e.target.value)}
          className="mt-2.5 w-full rounded-xl border border-zinc-300 bg-white py-2 px-3 text-xs outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <option value="">Todos os Autores</option>
          {authors.map((aut) => (
            <option key={aut.id} value={aut.id}>
              {aut.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Limit Slider range values - Removed per user request */}

      {/* Rating scale minimum value stars */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Avaliação Mínima
        </h4>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {[4, 4.5, 4.8].map((ratingVal) => (
            <button
              key={ratingVal}
              onClick={() => setMinRating(minRating === ratingVal ? 0 : ratingVal)}
              className={`flex items-center justify-between rounded-xl p-2.5 border text-left transition ${
                minRating === ratingVal
                  ? 'border-blue-500 bg-blue-50/30 text-blue-600 dark:bg-blue-950/20'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <RatingComponent rating={ratingVal} size="xs" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {ratingVal}+ Estrelas
                </span>
              </div>
              {minRating === ratingVal && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filter Button */}
      <button
        onClick={resetFilters}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 hover:text-zinc-800 dark:hover:bg-zinc-900 cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" /> Limpar Filtros
      </button>
    </div>
  );

  return (
    <div className="py-6 md:py-10 space-y-6" id="bookverse-catalog-route">
      
      {/* HEADER CRUMBS AND DETAILS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">Catálogo Completo</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Explorar Publicações</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Descubra obras excepcionais que combinam com o seu gosto literário.
          </p>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide font-mono">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white py-2 px-3 text-xs font-semibold outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="featured">Destaques Especiais</option>
            <option value="price-low">Preço: Menor para Maior</option>
            <option value="price-high">Preço: Maior para Menor</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="newest">Últimos Lançamentos</option>
          </select>
          
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="rounded-xl border border-zinc-300 p-2 text-zinc-500 bg-white hover:bg-zinc-50 md:hidden dark:border-zinc-800 dark:bg-zinc-950"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* CORE CATALOG CONTENT PLATFORM */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 pt-4">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <div className="hidden md:block md:col-span-1 border-r border-zinc-200 dark:border-zinc-800 pr-6 h-fit sticky top-22">
          <FiltersContent />
        </div>

        {/* BOOKS GRID CATALOG ROW */}
        <div className="md:col-span-3 space-y-8">
          {paginatedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="py-12">
              <EmptyState
                title="Nenhum Livro Encontrado"
                description="Não encontramos nenhum livro com os filtros ativos. Tente ajustar a faixa de preço, limpar os filtros ou buscar por palavras semelhantes."
                icon={Filter}
                actionLabel="Limpar Todos os Filtros"
                onAction={resetFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DRIFTING FILTER DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm"
          />
          {/* Sliding segment panel */}
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 p-6 h-full overflow-y-auto flex flex-col justify-between border-l border-zinc-100 dark:border-zinc-800 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4.5 w-4.5" /> Filtros de Pesquisa
                </h3>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FiltersContent />
            </div>
            
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="mt-8 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
