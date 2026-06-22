import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/useBookStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { PixelService } from '../services/PixelService';
import RatingComponent from '../components/RatingComponent';
import BookCard from '../components/BookCard';
import ModalComponent from '../components/ModalComponent';
import {
  Layers,
  BookOpen,
  ShoppingCart,
  Send,
  Heart,
  ChevronRight,
  ShieldCheck,
  Calendar,
  FileText,
  Bookmark,
  Store,
  MapPin,
  MessageSquare,
  Info,
  Phone,
} from 'lucide-react';

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { books, authors, reviews, addReview, toggleWishlist, isInWishlist, loadReviews } = useBookStore();
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useNotificationStore();

  const [selectedFormat, setSelectedFormat] = useState<'physical' | 'pdf' | 'epub'>('epub');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Review inputs
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');

  // Find targeted book
  const book = books.find((b) => b.id === id);

  useEffect(() => {
    if (id) loadReviews(id);
  }, [id, loadReviews]);

  if (!book) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Livro não encontrado</h2>
        <p className="text-zinc-500">A publicação que você solicitou não existe ou foi excluída..</p>
        <Link to="/catalog" className="inline-block rounded-xl bg-blue-600 text-white px-6 py-2">
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const author = authors.find((a) => a.id === book.authorId);
  const isFav = isInWishlist(book.id);
  const bookReviews = reviews.filter((r) => r.bookId === book.id);

  // Set default format based on availability if epub isn't supported
  useState(() => {
    if (!book.formats.includes('epub')) {
      setSelectedFormat(book.formats[0]);
    }
  });

  const handleAddToCart = () => {
    addItem(book, selectedFormat);
    
    // TRACK PIXEL
    PixelService.track('add_to_cart', {
      bookId: book.id,
      title: book.title,
      price: book.price,
      format: selectedFormat
    });

    showToast(`"${book.title}" [${selectedFormat.toUpperCase()}] adicionado ao carrinho!`, 'success');
  };

  const handleBuyNow = () => {
    addItem(book, selectedFormat);
    showToast(`"${book.title}" adicionado ao carrinho. Redirecionando para a finalização!`, 'success');
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('Faça login para adicionar aos favoritos.', 'warning');
      return;
    }
    await toggleWishlist(book.id);
    if (!isFav) {
      showToast(`Adicionado aos favoritos!`, 'success');
    } else {
      showToast(`Removido dos favoritos.`, 'info');
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Faça login para publicar uma avaliação.', 'warning');
      return;
    }
    if (!comment.trim()) {
      showToast('Por favor, escreva um comentário primeiro.', 'warning');
      return;
    }

    try {
      await addReview({
        bookId: book.id,
        userName: user?.name || 'Leitor',
        userAvatar: user?.avatar,
        rating: newRating,
        comment: comment.trim(),
      });
      showToast('Sua avaliação foi publicada. Obrigado!', 'success');
      setComment('');
    } catch {
      showToast('Erro ao publicar avaliação.', 'error');
    }
  };

  // Get related books in the same category
  const relatedBooks = books
    .filter((b) => b.categoryId === book.categoryId && b.id !== book.id)
    .slice(0, 4);

  return (
    <div className="py-6 md:py-10 space-y-12" id="bookverse-bookdetails-route">
      
      {/* 1. BREADCRUMBS PATH */}
      <div className="flex items-center gap-1.5 text-xs text-zinc- font-semibold font-mono uppercase tracking-wider">
        <Link to="/" className="hover:text-blue-600">Início</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/catalog" className="hover:text-blue-600">Catálogo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-500 max-w-xs truncate">{book.title}</span>
      </div>

      {/* 2. CORE BOOK GRID INFO */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 items-start" id="book-primary-presentation">
        
        {/* Cover visual row */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
          <div className="relative aspect-[3/4.2] w-full max-w-sm rounded-3xl bg-zinc-950 overflow-hidden flex items-center justify-center text-white shadow-2xl border border-zinc-200 dark:border-zinc-800">
            {/* Spine visual indicator */}
            <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor} opacity-95`} />
            <div className="absolute top-0 bottom-0 left-0 w-4.5 bg-black/15 z-10" />
            <div className="absolute top-0 bottom-0 left-4.5 w-0.5 bg-white/5 z-10" />

            {/* Title / Author */}
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="absolute inset-0 h-full w-full object-cover z-0" />
            ) : (
              <div className="relative z-10 p-8 flex flex-col justify-between h-full w-full text-center">
                <span className="text-xs font-mono text-zinc-300 uppercase self-center tracking-widest leading-none">
                  {author?.name || book.authorId || 'Editora Mulemba'}
                </span>
                <div className="flex flex-col gap-2.5 items-center my-auto px-2">
                  <span className="font-serif font-black text-xl sm:text-2xl leading-tight">
                    {book.title}
                  </span>
                  <span className="h-1 w-12 bg-amber-400 rounded-full" />
                  <span className="text-xs text-zinc-300 italic">Edição Curada</span>
                </div>
                <span className="text-xs font-mono text-zinc-400 self-center">
                  ISBN: {book.isbn || '978-MULEMBA-AO'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="mt-6 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 py-2.5 px-6 font-bold text-xs hover:bg-zinc-50 w-full max-w-sm dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer text-zinc-900 dark:text-zinc-50"
          >
            <Bookmark className="h-4 w-4 text-blue-500" /> Ler Amostra Grátis
          </button>
        </div>

        {/* Info detail block */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {book.type === 'digital' ? 'eBook Digital Especial' : book.type === 'physical' ? 'Edição Física para Colecionador' : 'Combo Físico & Digital'}
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-50 font-sans">
              {book.title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              por <span className="font-semibold text-blue-700 dark:text-blue-400">{author?.name || book.authorId}</span>
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <RatingComponent rating={book.rating} size="sm" reviewsCount={bookReviews.length} />
              <span className="text-xs text-zinc-400 font-medium font-mono">| {book.pages} páginas</span>
            </div>
          </div>

          {/* Book Format selection layout */}
          <div className="rounded-2xl border border-zinc-200 p-5 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold text-zinc- uppercase tracking-widest font-mono">Escolha o Canal / Formato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {book.formats.includes('physical') && (
                <button
                  onClick={() => setSelectedFormat('physical')}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    selectedFormat === 'physical'
                      ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-inner'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                    <Layers className="h-4 w-4 text-blue-600" /> Livro Físico
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 leading-relaxed">Encadernação premium de alta qualidade e com capa protetora.</span>
                  <span className="text-sm font-black text-zinc-900 mt-3 dark:text-zinc-100 font-mono">Kz {book.price.toLocaleString('pt-AO')}</span>
                </button>
              )}
              {book.formats.includes('pdf') && (
                <button
                  onClick={() => setSelectedFormat('pdf')}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    selectedFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                    <FileText className="h-4 w-4 text-rose-500" /> Baixar PDF
                  </div>
                  <span className="text-xs text-zinc-500 mt-1">Arquivos vetoriais em alta fidelidade. Otimizado para telas e tablets.</span>
                  <span className="text-sm font-black text-zinc-900 mt-3 dark:text-zinc-100 font-mono">Kz {book.price.toLocaleString('pt-AO')}</span>
                </button>
              )}
              {book.formats.includes('epub') && (
                <button
                  onClick={() => setSelectedFormat('epub')}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    selectedFormat === 'epub'
                      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                    <BookOpen className="h-4 w-4 text-emerald-500" /> eBook EPUB
                  </div>
                  <span className="text-xs text-zinc-500 mt-1">Padrão digital fluído. Ajustável para e-readers e leitores de ePub.</span>
                  <span className="text-sm font-black text-zinc-900 mt-3 dark:text-zinc-100 font-mono">Kz {book.price.toLocaleString('pt-AO')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Checkout controls buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {book.sellerId === user?.id ? (
               <div className="flex-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl py-3.5 px-4 text-center">
                 <span className="block text-amber-800 dark:text-amber-400 font-bold text-sm">Este é o seu próprio anúncio.</span>
                 <span className="block text-amber-700 dark:text-amber-500 text-xs mt-0.5 font-mono">Não é possível efetuar a compra de um item que você cadastrou.</span>
               </div>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-bold text-white shadow-md cursor-pointer transition"
                >
                  <ShoppingCart className="h-4.5 w-4.5" /> Adicionar ao Carrinho
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 text-sm font-bold text-black shadow-md cursor-pointer transition"
                >
                  Comprar Agora
                </button>
              </>
            )}
            <button
              onClick={handleWishlist}
              className={`rounded-xl border p-3.5 transition shrink-0 ${
                isFav
                  ? 'border-rose-100 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900'
                  : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-950/20 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
            <strong>Garantia de Entrega Livraria Mulemba:</strong> Todos os formatos digitais (EPUB, PDF) ficam disponíveis em sua Biblioteca Digital imediatamente após a compra. Livros físicos são embalados em atmosfera controlada com rastreamento ativo de ponta a ponta.
          </p>

          {/* SELLER REAL CONNECTION BOX */}
          {book.sellerName && (
            <div className="rounded-2xl border border-zinc-200/80 p-5 bg-blue-50/10 dark:bg-zinc-950/40 dark:border-zinc-800 space-y-3.5 text-left text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                <span className="font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider">
                  <Info className="h-4 w-4 text-blue-600" /> Origem e Vendedor
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full dark:bg-zinc-800 dark:text-blue-400">
                  {book.sellerType === 'bookstore' ? 'Livraria' : book.sellerType === 'publisher' ? 'Editora' : book.sellerType === 'author' ? 'Autor' : 'Usado / Brechó'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Cadastrado por:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{book.sellerName}</span>
                </div>

                {book.condition && book.condition !== 'new' && (
                  <div className="flex flex-col gap-1 p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/15">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800 dark:text-amber-300 font-bold">Estado do Usado:</span>
                      <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                        {book.condition === 'used_like_new' ? 'Como Novo' : book.condition === 'used_very_good' ? 'Muito Bom' : book.condition === 'used_good' ? 'Bom' : 'Aceitável'}
                      </span>
                    </div>
                    {book.conditionNotes && (
                      <p className="text-[11px] text-zinc-700 leading-relaxed italic mt-0.5 dark:text-zinc-400">"{book.conditionNotes}"</p>
                    )}
                  </div>
                )}

                {book.city && (
                  <div className="flex items-center gap-1 text-zinc-500 font-semibold font-mono text-[11px] mt-1">
                    <MapPin className="h-4 w-4 text-zinc-400 shrink-0" /> Retirada / Envio local: {book.city}, {book.state || 'BR'}
                  </div>
                )}
              </div>

              {book.whatsapp && (
                <a
                  href={`https://wa.me/${book.whatsapp.replace(/\D/g, '')}?text=Olá,%20tenho%20interesse%20no%20livro%20"${encodeURIComponent(book.title)}"%20anunciado%20na%20Livraria%20Mulemba!"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white py-2.5 text-xs text-center cursor-pointer transition shadow hover:shadow-emerald-500/10 no-underline mt-2.5"
                >
                  <MessageSquare className="h-4 w-4" /> Entrar em contato via WhatsApp
                </a>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 3. EXTENDED TAB DESCRIPTION AND AUTHOR BIOGRAPHY */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="md:col-span-2 space-y-4 text-left">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Sinopse da Obra</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
            {book.description}
            
            {"\n\n"}
            Esta publicação especial representa um rigoroso padrão de curadoria literária. Ao longo das páginas, o leitor descobrirá narrativas envolventes e análises aprofundadas projetadas para inspirar e cativar sua atenção. Todos os capítulos contam com diagramações fluidas e de altíssimo acabamento.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono">
            <div className="bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl">
              <span className="text-zinc-400 block uppercase tracking-wider font-semibold">Distribuidora / Selo</span>
              <span className="text-zinc-900 dark:text-zinc-100 mt-1 block font-bold">{book.publisher || 'Editora Mulemba'}</span>
            </div>
            <div className="bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl">
              <span className="text-zinc- block uppercase tracking-wider font-semibold">Data de Lançamento</span>
              <span className="text-zinc-900 dark:text-zinc-100 mt-1 block font-bold">{book.publishedDate}</span>
            </div>
          </div>
        </div>

        {/* AUTHOR BIO CARD */}
        <div className="md:col-span-1 rounded-2xl border border-zinc-200 p-6 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-3.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <img
              src={author?.avatar}
              alt={author?.name || book.authorId}
              className="h-12 w-12 rounded-full object-cover border"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{author?.name || book.authorId}</h4>
              <p className="text-xs text-zinc- font-mono mt-0.5">{author?.booksCount || 1} Obras Publicadas</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {author?.bio}
          </p>
        </div>
      </div>

      {/* 4. CUSTOMER REVIEWS FOR THIS PRODUCT */}
      <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Avaliações dos Leitores ({bookReviews.length})</h3>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Write a review module */}
          <div className="rounded-2xl border border-zinc-200 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Deixe sua avaliação</h4>
            <form onSubmit={handlePostReview} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wide font-mono block mb-1">Escolha a nota</label>
                <RatingComponent rating={newRating} size="sm" interactive={true} onChange={setNewRating} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wide font-mono block mb-1">Seu comentário</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escreva sua opinião honesta sobre a obra..."
                  className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm font-sans"
              >
                <Send className="h-3.5 w-3.5" /> Enviar Avaliação
              </button>
            </form>
          </div>

          {/* List existing reviews feedback */}
          <div className="lg:col-span-2 space-y-4">
            {bookReviews.length > 0 ? (
              bookReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-zinc-110 p-5 bg-white dark:bg-zinc-900 dark:border-zinc-800/40 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={rev.userName}
                        className="h-8 w-8 rounded-full border border-zinc-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{rev.userName}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">{rev.date}</span>
                      </div>
                    </div>
                    <RatingComponent rating={rev.rating} size="xs" />
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-zinc-430 dark:border-zinc-800">
                Seja o primeiro leitor a avaliar e deixar um comentário sobre "{book.title}"!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. RELATED BOOKS RECOMMENDATIONS */}
      {relatedBooks.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Obras Relacionadas</h3>
            <span className="text-xs text-zinc- font-mono tracking-widest uppercase">Mesma Categoria</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}

      {/* 6. SAMPLE PREVIEW MODAL */}
      <ModalComponent
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Demonstração de Leitura: "${book.title}"`}
        size="lg"
      >
        <div className="space-y-5 select-none font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 antialiased p-2">
          <p className="text-xs uppercase tracking-widest font-mono text-zinc- border-b pb-1.5 mb-4">Capítulo 1: O Começo de Tudo</p>
          <p className="first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 text-sm">
            Os ventos marítimos frios do início de novembro carregavam uma névoa salgada e úmida sobre as velhas docas de madeira de Sterling Inlet. Por quarenta anos, a cápsula metálica permaneceu intocada sob as vigas apodrecidas do píer seis, silenciosa e pesadamente coberta por camadas de óxido.
          </p>
          <p className="text-sm">
            Arthur ajeitou seu casaco térmico, tomando um gole lento de café de chicória sem açúcar. O leitor magnético em seu tablet emitiu de repente um bipe rítmico agudo. Não era a assinatura de cabos antigos ou motores descartados. O índice de densidade era uniforme, frio e extremamente estruturado.
          </p>
          <p className="text-sm">
            "Alinhamento de escala concluído", murmurou, deslizando os dedos enluvados sobre a tela. Ele sabia o que esses valores significavam. Esses códigos datavam dos setores divididos das operações do laboratório de Berlim. Que as respostas comecem a surgir, ele pensou.
          </p>
          <div className="bg-amber-50/50 dark:bg-zinc-900 p-4 rounded-xl border border-dashed border-amber-300 dark:border-zinc-700 text-center font-mono text-xs text-zinc-500 mt-6 select-text">
            🌟 Fim da demonstração gratuita! Adicione "{book.title}" ({selectedFormat.toUpperCase()}) ao seu carrinho de compras para continuar a ler os capítulos restantes.
          </div>
        </div>
      </ModalComponent>

    </div>
  );
}
