import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useBookStore } from '../store/useBookStore';
import BookCard from '../components/BookCard';
import CategoryCard from '../components/CategoryCard';
import RatingComponent from '../components/RatingComponent';
import { useNotificationStore } from '../store/useNotificationStore';
import { useCartStore } from '../store/useCartStore';
import { BookOpen, ArrowRight, ShieldCheck, Mail, Sparkles, BookMarked, Globe } from 'lucide-react';

export default function Home() {
  const { books, categories, setSelectedCategoryId, reviews } = useBookStore();
  const showToast = useNotificationStore((state) => state.showToast);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();
  const [newsEmail, setNewsEmail] = useState('');

  // Slices
  const featuredBooks = books.slice(0, 4);
  const bestSellers = books.filter((b) => b.bestSeller).slice(0, 4);
  const newReleases = books.filter((b) => b.newRelease).slice(0, 4);

  const handleCategoryClick = (catId: string) => {
    setSelectedCategoryId(catId);
    navigate('/catalog');
  };

  const handleQuickSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail.trim() || !newsEmail.includes('@')) {
      showToast('Por favor, insira um endereço de e-mail válido.', 'warning');
      return;
    }
    showToast(`Inscrição feita com sucesso com o e-mail ${newsEmail}! Use o cupom MULEMBA20 para ganhar 20% de desconto no seu primeiro pedido!`, 'success');
    setNewsEmail('');
  };

  const handleFastBuyHero = () => {
    // Find the first book that has the 'epub' format
    const epubBook = books.find((b) => b.formats.includes('epub'));
    if (epubBook) {
      addItem(epubBook, 'epub');
      showToast(`Adicionado "${epubBook.title}" (EPUB) ao seu carrinho!`, 'success');
      navigate('/cart');
    } else {
      showToast('Nenhum livro ePUB disponível no momento.', 'info');
    }
  };

  return (
    <div className="space-y-16 py-6 md:py-10" id="bookverse-homepage">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white py-12 px-6 sm:px-12 md:py-20 lg:px-16" id="banner-hero">
        {/* Abstract futuristic glowing gradient or sphere backgrounds */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 tracking-wider uppercase">
              <Sparkles className="h-3 w-3 animate-spin-slow" /> Horizonte de Leitura 2026
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-sans">
              Onde seu <span className="text-amber-400">Próximo Capítulo</span> Começa
            </h1>
            <p className="text-base text-zinc-300 max-w-lg leading-relaxed">
              Explore nossas edições físicas primorosamente encadernadas e baixe eBooks instantaneamente. Conectando leitores, sebos locais, livreiros e autores independentes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:scale-102 active:scale-98 transition-all duration-155"
              >
                Explorar Livraria <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={handleFastBuyHero}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/40 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 cursor-pointer"
              >
                Compra Rápida de ePUB
              </button>
            </div>
          </div>

          {/* Floated Graphic Card showing Book-1 Cover */}
          <div className="md:col-span-5 flex justify-center mt-6 md:mt-0">
            <motion.div
              initial={{ rotate: -2, y: 15 }}
              animate={{ rotate: 3, y: -5 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 3.5, ease: "easeInOut" }}
              className="relative aspect-[3/4.2] w-60 rounded-2xl bg-gradient-to-br from-blue-700 via-teal-850 to-indigo-900 p-6 flex flex-col justify-between text-white shadow-2xl shadow-blue-500/10 border border-white/5"
            >
              {/* spine line */}
              <div className="absolute top-0 bottom-0 left-0 w-3 bg-black/15 z-10" />
              <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-white/5 z-10" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 self-center">Pepetela</span>
              
              <div className="flex flex-col gap-1 text-center items-center">
                <span className="font-serif font-black text-lg leading-tight">Mayombe</span>
                <span className="h-0.5 w-8 bg-amber-400 rounded my-1" />
                <span className="text-[10px] text-zinc-300 italic">Clássico Angolano</span>
              </div>

              <div className="flex justify-between items-center z-10">
                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">Kz 6.500</span>
                <span className="text-[9px] font-mono text-zinc-300">ISBN: 148410-0</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DYNAMIC COMPONENT: 2. FEATURED BOOKS */}
      <section id="section-featured">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">Recomendações Especiais</span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Obras em Destaque</h2>
          </div>
          <Link to="/catalog" className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-410">
            Ver Todos <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 4. CATEGORIES SECTIONS */}
      <section className="bg-zinc-50/70 p-8 rounded-3xl dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900/40" id="section-categories">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 font-mono">Navegar por Categorias</span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Navegue por Universos Literários</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mt-2">
            Refine sua pesquisa encontrando categorias específicas, desde engenharia de software até romances clássicos.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS */}
      <section id="section-bestsellers">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 font-mono font-bold">Mais Vendidos</span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Mais Queridos do Público</h2>
          </div>
          <Link to="/catalog" className="group flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400">
            Ver Best-sellers <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 5. NEW RELEASES */}
      <section id="section-newreleases">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-410 font-mono">As Últimas Novidades</span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Lançamentos Recentes</h2>
          </div>
          <Link to="/catalog" className="group flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400">
            Explorar Recentes <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newReleases.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      {reviews && reviews.length > 0 && (
      <section className="space-y-6" id="section-reviews">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">Depoimentos dos Leitores</span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Opinião de Quem já Comprou</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="rounded-2xl border border-zinc-200 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-zinc-700 dark:text-zinc-400 leading-relaxed">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-3 mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{review.userName}</h4>
                  <div className="mt-0.5"><RatingComponent rating={review.rating} size="xs" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* 7. NEWSLETTER STANDALONE BANNER */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 md:p-12 text-center relative overflow-hidden shadow-lg" id="newsletter-subscription-box">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-amber-500/10 rounded-full -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white mx-auto shadow-inner">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans">Você é um explorador literário?</h2>
          <p className="text-sm text-blue-100 max-w-sm mx-auto leading-relaxed">
            Inscreva-se na nossa newsletter para receber avaliações curadas, cupons de descontos exclusivos e lançamentos diretamente em sua caixa de entrada.
          </p>
          <form onSubmit={handleQuickSubscribe} className="pt-2 flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              placeholder="Digite seu e-mail de contato..."
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-xs text-white placeholder-blue-200 outline-none focus:bg-white focus:text-zinc-900 focus:placeholder-zinc-400 shadow-sm transition-all"
            />
            <button
              type="submit"
              className="w-full sm:w-auto flex-shrink-0 cursor-pointer text-xs font-bold uppercase rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow px-6 py-3 transition hover:scale-103"
            >
              Pegar Meu Cupom
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER SERVICES METRICS */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3 border-y border-zinc-100 dark:border-zinc-800 py-10 my-4 text-center">
        <div className="space-y-1">
          <div className="mx-auto rounded-full bg-blue-50 dark:bg-zinc-800 w-10 h-10 flex items-center justify-center text-blue-600 dark:text-blue-410">
            <Globe className="h-5 w-5 animate-pulse" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Envia para Toda Angola</h4>
          <p className="text-xs text-zinc-400">Embalagem protetora especial e frete rápido com rastreamento.</p>
        </div>
        <div className="space-y-1">
          <div className="mx-auto rounded-full bg-blue-50 dark:bg-zinc-800 w-10 h-10 flex items-center justify-center text-blue-600 dark:text-blue-410">
            <BookMarked className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Leitura Digital Completa</h4>
          <p className="text-xs text-zinc-400">Suporte a formatos ePUB e PDF de alta qualidade para e-readers.</p>
        </div>
        <div className="space-y-1">
          <div className="mx-auto rounded-full bg-blue-50 dark:bg-zinc-900 w-10 h-10 flex items-center justify-center text-blue-600 dark:text-blue-410">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Garantia e Proteção Total</h4>
          <p className="text-xs text-zinc-400">Conexão direta segura e canais diretos integrados.</p>
        </div>
      </section>

    </div>
  );
}
