import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBookStore } from '../store/useBookStore';
import RatingComponent from '../components/RatingComponent';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  User,
  ShoppingBag,
  Heart,
  Library,
  Save,
  CheckCircle,
  Truck,
  RotateCcw,
  BookOpen,
  Mail,
  Calendar,
  Lock,
  Store,
  BookHeart,
  Plus,
  Trash2,
  MapPin,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const showToast = useNotificationStore((state) => state.showToast);

  const { user, updateProfile, logout } = useAuthStore();
  const { books, wishlist, library, orders, addBook, deleteBook, categories, authors } = useBookStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'library' | 'seller-portal'>('profile');

  // Profile Edit fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileCompanyName, setProfileCompanyName] = useState(user?.companyName || '');
  const [profileCity, setProfileCity] = useState(user?.city || '');
  const [profileState, setProfileState] = useState(user?.state || '');
  const [profileWhatsapp, setProfileWhatsapp] = useState(user?.whatsapp || '');

  // Add Book Form States for Seller / Used Book Portal
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newDescription, setNewDescription] = useState('');
  const [newStock, setNewStock] = useState(5);
  const [newPages, setNewPages] = useState(200);
  const [newIsbn, setNewIsbn] = useState('');
  const [newCondition, setNewCondition] = useState<'new' | 'used_like_new' | 'used_very_good' | 'used_good' | 'used_acceptable'>('new');
  const [newConditionNotes, setNewConditionNotes] = useState('');
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newEbookFile, setNewEbookFile] = useState<File | null>(null);
  const [newShippingCost, setNewShippingCost] = useState<number | ''>('');
  const [newBookType, setNewBookType] = useState<'physical' | 'digital' | 'both'>('physical');

  // Handle default tab routing states (e.g. redirected from cart/checkout)
  useEffect(() => {
    const state = location.state as { defaultTab?: any };
    if (state && state.defaultTab) {
      setActiveTab(state.defaultTab);
    }
  }, [location.state]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      showToast('Nome e e-mail são obrigatórios.', 'warning');
      return;
    }
    updateProfile({
      name: profileName,
      bio: profileBio,
      email: profileEmail,
      companyName: user?.userType !== 'reader' ? profileCompanyName : undefined,
      city: profileCity,
      state: profileState,
      whatsapp: profileWhatsapp,
      phone: profileWhatsapp,
    });
    showToast('Suas preferências de perfil foram atualizadas com sucesso!', 'success');
  };

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthorName.trim() || !newDescription.trim()) {
      showToast('Por favor, preencha o título, o autor e uma descrição detalhada da obra.', 'warning');
      return;
    }

    // Dynamic publisher imprint
    const resolvedPublisher = user?.userType === 'publisher'
      ? (user.companyName || user.name)
      : user?.userType === 'bookstore'
      ? (user.companyName || user.name)
      : 'Autopublicação';

    // Cover specifications
    const coverColors = [
      'from-blue-700 via-teal-800 to-indigo-900',
      'from-orange-800 via-amber-900 to-red-950',
      'from-purple-800 via-indigo-950 to-emerald-950',
      'from-neutral-700 via-stone-800 to-neutral-950',
      'from-emerald-700 via-green-800 to-teal-950'
    ];
    const pickedColor = coverColors[Math.floor(Math.random() * coverColors.length)];
    
    let coverImageUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=450&auto=format&fit=crop&q=80';
    let ebookFileUrl = '';
    
    try {
      const { bookService } = await import('../services/bookService');
      if (newCoverFile) {
        coverImageUrl = await bookService.uploadFile(newCoverFile);
      }
      if (newEbookFile && newBookType !== 'physical') {
        ebookFileUrl = await bookService.uploadFile(newEbookFile);
      }
    } catch (err) {
      showToast('Erro ao processar arquivos. Usando capa padrão.', 'warning');
    }

    const bookData: any = {
      title: newTitle,
      authorId: newAuthorName,
      categoryId: newCategoryId,
      description: newDescription,
      price: newPrice === '' ? 0 : Number(newPrice),
      coverImage: coverImageUrl,
      ebookFileUrl: ebookFileUrl,
      coverColor: 'from-blue-600 to-indigo-805',
      type: newBookType,
      formats: newBookType === 'both' ? ['physical', 'pdf', 'epub'] : newBookType === 'physical' ? ['physical'] : ['pdf', 'epub'],
      stock: newBookType === 'digital' ? 999 : Number(newStock),
      pages: newPages,
      publishedDate: new Date().toISOString().split('T')[0],
      isbn: newIsbn || 'N/A',
      publisher: resolvedPublisher,
      
      // Connection values
      sellerId: user?.id,
      sellerType: user?.userType,
      sellerName: user?.userType === 'reader' ? user.name : (user?.companyName || user?.name),
      condition: newCondition,
      conditionNotes: newCondition !== 'new' ? newConditionNotes : undefined,
      shippingCost: (newBookType !== 'digital' && newShippingCost !== '') ? Number(newShippingCost) : undefined,
      city: user?.city,
      state: user?.state,
      whatsapp: user?.whatsapp || user?.phone,
    };

    try {
      await addBook(bookData);
      showToast(`O livro "${newTitle}" foi anunciado com sucesso no catálogo!`, 'success');
      
      // Reset Form fields
      setNewTitle('');
      setNewAuthorName('');
      setNewDescription('');
      setNewPrice('');
      setNewStock(5);
      setNewShippingCost('');
      setNewIsbn('');
      setNewConditionNotes('');
      setNewCoverFile(null);
      setNewEbookFile(null);
      setIsAddBookOpen(false);
    } catch (err) {
      showToast('Ocorreu um erro ao anunciar o livro. Verifique suas permissões.', 'error');
    }
  };

  const handleRemoveSellerBook = (id: string, name: string) => {
    if (confirm(`Tem certeza absoluta de que deseja remover o anúncio de "${name}"?`)) {
      deleteBook(id);
      showToast('O livro foi removido do catálogo.', 'info');
    }
  };

  const wishlistBooks = books.filter((b) => wishlist.includes(b.id));

  // Filter listed books owned by this user
  const myListedBooks = books.filter((b) => b.sellerId === user?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase dark:bg-emerald-950/20 dark:text-emerald-400 font-mono">
            <CheckCircle className="h-3 w-3" /> Entregue
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-705 border border-indigo-250 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase dark:bg-indigo-950/20 dark:text-indigo-400 font-mono">
            <Truck className="h-3 w-3" /> Enviado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase dark:bg-rose-950/20 dark:text-rose-500 font-mono">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase dark:bg-amber-950/20 dark:text-amber-400 font-mono animate-pulse">
            Processando
          </span>
        );
    }
  };

  // Helper labels for UserType Portuguese
  const getPortugueseUserType = (type?: string) => {
    switch (type) {
      case 'bookstore': return '📚 Livraria Oficial';
      case 'publisher': return '🏢 Editora Parceira';
      case 'author': return '✍️ Autor Independente';
      default: return '👤 Leitor';
    }
  };

  const getPortugueseTabLabel = (type?: string) => {
    switch (type) {
      case 'bookstore': return 'Gerenciar estoque';
      case 'publisher': return 'Gerenciar catálogo';
      case 'author': return 'Meus autopublicados';
      default: return 'Meus desapegos (usados)';
    }
  };

  const getPortuguesePortalTitle = (type?: string) => {
    switch (type) {
      case 'bookstore': return 'Painel de Estoque da Livraria';
      case 'publisher': return 'Painel de Lançamento de Catálogo';
      case 'author': return 'Painel de Autopublicação de Obras';
      default: return 'Painel de Desapego de Livros Usados (Membro)';
    }
  };

  const getPortuguesePortalPlaceholder = (type?: string) => {
    switch (type) {
      case 'bookstore': return 'Seu estoque da livraria está vazio. Adicione livros novos ou físicos que você possui em sua loja local!';
      case 'publisher': return 'A editora ainda não publicou títulos. Lance lançamentos digitais ou físicos diretamente para o leitor!';
      case 'author': return 'Você ainda não autopublicou obras no portal. Comece a compartilhar suas criações originais com o mundo!';
      default: return 'Você ainda não colocou nenhum livro usado à venda. Facilite o reuso: desapegue do livro físico que já leu!';
    }
  };

  return (
    <div className="py-6 md:py-10 space-y-8" id="bookverse-user-dashboard">
      
      {/* ACCOUNT BANNER SECTION */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 text-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/15 rounded-full pointer-events-none blur-3xl" />
        <img
          src={user?.avatar}
          alt={user?.name}
          className="h-20 w-20 rounded-full border-2 border-amber-400 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-col md:flex-row md:items-center p-0.5 gap-2">
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-blue-600 rounded-md px-2.5 py-0.5 w-fit mx-auto md:mx-0">
              {getPortugueseUserType(user?.userType)}
            </span>
            {user?.role === 'admin' && (
              <span className="text-[9px] font-mono bg-zinc-700 rounded px-1.5 py-0.5">🔒 Admin</span>
            )}
          </div>
          <p className="text-sm text-zinc-300 max-w-xl">{user?.bio || 'Leitor e participante ativo da rede digital.'}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-zinc-400 mt-2">
            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
            {user?.city && (
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.city}, {user.state || 'BR'}</span>
            )}
            {user?.whatsapp && (
              <span className="flex items-center gap-1 text-emerald-400"><MessageSquare className="h-3.5 w-3.5" /> {user.whatsapp}</span>
            )}
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Desde: {user?.memberSince}</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
             <div className="bg-zinc-800 rounded-lg px-3 py-1.5 text-center border border-zinc-700">
                <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold font-mono">No Catálogo Geral</span>
                <span className="block text-sm font-black text-blue-400">{books.length}</span>
             </div>
             {user?.userType !== 'reader' && (
               <div className="bg-zinc-800 rounded-lg px-3 py-1.5 text-center border border-zinc-700">
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold font-mono">Meus Livros Cadastrados</span>
                  <span className="block text-sm font-black text-amber-400">{myListedBooks.length}</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* TABS SELECTOR CONTAINER ROW */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1">
        {[
          { id: 'profile', label: 'Meu perfil', icon: User },
          { id: 'seller-portal', label: getPortugueseTabLabel(user?.userType), icon: LayoutDashboard },
          { id: 'orders', label: 'Histórico de pedidos', icon: ShoppingBag },
          { id: 'wishlist', label: 'Minhas curtidas', icon: Heart },
          { id: 'library', label: 'E-books salvos', icon: Library },
        ].filter(tab => !(tab.id === 'seller-portal' && user?.userType === 'reader'))
         .map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-t-xl px-4 py-3 text-xs font-bold uppercase tracking-wider select-none border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 bg-blue-50/20 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-200'
              }`}
            >
              <TabIcon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CORE ACTIVE PANEL DISPLAY AREA */}
      <div className="pt-2 animate-fade-in" id="dashboard-active-tab-content">
        
        {/* T-1: PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="max-w-xl rounded-2xl border border-zinc-200 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 border-b pb-1.5 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-blue-500" /> Configurações de Perfil
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Nome de Exibição</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1 font-mono">E-mail de Contato</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* CORPORATE SPECIFIC SETTINGS */}
              {user?.userType !== 'reader' && (
                <div>
                  <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Nome Oficial da Entidade (Livraria / Editora)</label>
                  <input
                    type="text"
                    required
                    value={profileCompanyName}
                    onChange={(e) => setProfileCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Cidade Sede</label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={profileState}
                    onChange={(e) => setProfileState(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-center text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">WhatsApp de Contato (Direct Trade/Reselling)</label>
                <input
                  type="text"
                  value={profileWhatsapp}
                  onChange={(e) => setProfileWhatsapp(e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Minha Biografia / Slogan corporativo</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 px-6 text-xs font-bold text-white shadow-md cursor-pointer text-center select-none"
            >
              <Save className="h-4 w-4" /> Salvar Alterações de Perfil
            </button>
          </form>
        )}

        {/* COMPREHENSIVE SELLER & USED MARKETPLACE PORTAL PANEL */}
        {activeTab === 'seller-portal' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-blue-500" /> {getPortuguesePortalTitle(user?.userType)}
                </h3>
                <p className="text-xs text-zinc-400">Total de títulos anunciados por seu perfil: <span className="font-bold underline text-blue-500">{myListedBooks.length}</span></p>
              </div>

              <button
                onClick={() => setIsAddBookOpen(!isAddBookOpen)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 cursor-pointer shadow-sm ml-auto sm:ml-0"
              >
                {isAddBookOpen ? 'Recolher Formulário' : 'Anunciar Novo Livro'} <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* EXPANDABLE BOOK REGISTER FORM (DYNAMICALLY ADJUSTED BASED ON CORRESPONDING TYPE) */}
            {isAddBookOpen && (
              <form onSubmit={handleAddBookSubmit} className="rounded-2xl border border-zinc-200 p-6 bg-zinc-50 dark:bg-zinc-900/60 dark:border-zinc-800 space-y-4 animate-slide-in">
                <h4 className="text-sm font-bold border-b pb-2 flex items-center gap-1 text-zinc-800 dark:text-zinc-100">
                  <PlusCircle className="h-4.5 w-4.5 text-blue-500" /> Dados do Cadastro Litérário
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Título do Livro *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: Dom Casmurro Edição Especial"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Nome do Autor *</label>
                    <input
                      type="text"
                      required
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="Ex: Machado de Assis"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Gênero / Categoria *</label>
                    <select
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="" disabled>Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Preço Cobrado (Kz) *</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Estoque Inicial (Físico)</label>
                    <input
                      type="number"
                      min="1"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Estado de Conservação *</label>
                    <select
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="new">Novo (Direto da Editora/Autor/Livraria)</option>
                      <option value="used_like_new">Usado - Como Novo</option>
                      <option value="used_very_good">Usado - Muito Bom</option>
                      <option value="used_good">Usado - Bom Estado</option>
                      <option value="used_acceptable">Usado - Aceitável</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Código ISBN (opcional)</label>
                    <input
                      type="text"
                      value={newIsbn}
                      onChange={(e) => setNewIsbn(e.target.value)}
                      placeholder="978-85-..."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Capa do Livro (opcional)</label>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setNewCoverFile(e.target.files[0]);
                        } else {
                          setNewCoverFile(null);
                        }
                      }}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-[5px] text-xs text-zinc-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:border-zinc-800 dark:bg-zinc-950 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Formato Disponível *</label>
                    <select
                      value={newBookType}
                      onChange={(e) => setNewBookType(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="physical">Apenas Físico (Padrão Usados/Livraria)</option>
                      <option value="digital">Apenas Digital (PDF / ePUB - Ideal Editoras)</option>
                      <option value="both">Físico + E-book conjunto</option>
                    </select>
                  </div>
                </div>

                {newBookType !== 'physical' && (
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Ficheiro do Livro Digital (PDF ou ePUB) *</label>
                    <input
                      type="file"
                      accept=".pdf,.epub"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setNewEbookFile(e.target.files[0]);
                        } else {
                          setNewEbookFile(null);
                        }
                      }}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-[5px] text-xs text-zinc-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:border-zinc-800 dark:bg-zinc-950 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                    />
                    <p className="text-[9px] text-zinc-400 mt-1">Este ficheiro será protegido contra downloads e ecrãs na plataforma.</p>
                  </div>
                )}

                {newCondition !== 'new' && (
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Detalhes de Uso e Marcas (Importante para Usados) *</label>
                    <input
                      type="text"
                      required
                      value={newConditionNotes}
                      onChange={(e) => setNewConditionNotes(e.target.value)}
                      placeholder="Ex: Lombada intacta, sem grifos, amarelado nas bordas das páginas."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                )}

                {newBookType !== 'digital' && (
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Custo do Frete (opcional)</label>
                    <input
                      type="number"
                      min="0"
                      value={newShippingCost}
                      onChange={(e) => setNewShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Deixe vazio se for Grátis ou a combinar"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold font-mono uppercase block mb-1">Sinopse do Livro / Descrição do Anúncio *</label>
                  <textarea
                    rows={3}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Escreva uma bela introdução da obra para atrair o leitor..."
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>

                <div className="flex gap-4 p-3 bg-blue-500/10 rounded-xl text-xs dark:bg-blue-500/5 select-none text-left">
                  <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Sua localização foi detectada!</span>
                    <span className="text-zinc-500 mt-0.5 block leading-relaxed">
                      Este anúncio será registrado em <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.city || 'sua localização'}, {user?.state || 'BR'}</span>. Certifique-se de que os dados de localização estão preenchidos no seu Perfil para desapegos e compras locais.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs py-3 select-none text-center cursor-pointer transition"
                >
                  Concluir e Publicar no Catálogo Geral
                </button>
              </form>
            )}

            {/* LISTED INVENTORY SECTION GRID */}
            {myListedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListedBooks.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-zinc-200 p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-start shadow-sm hover:shadow transition">
                    <div className={`h-24 w-16 shrink-0 rounded bg-gradient-to-br ${b.coverColor} shadow relative flex items-center justify-center text-white text-[8px] font-black uppercase text-center overflow-hidden`}>
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-black/15" />
                      COV
                    </div>
                    
                    <div className="text-left flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {b.condition ? (
                          <span className="text-[8px] tracking-wide font-mono font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                            Usado - {b.condition === 'used_like_new' ? 'Como Novo' : b.condition === 'used_very_good' ? 'Muito Bom' : b.condition === 'used_good' ? 'Bom' : 'Aceitável'}
                          </span>
                        ) : (
                          <span className="text-[8px] tracking-wide font-mono font-extrabold uppercase bg-blue-100 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">
                            Novo
                          </span>
                        )}
                        <span className="text-[8px] bg-zinc-100 text-zinc-500 border rounded px-1.5 py-0.5 uppercase tracking-wide font-mono">
                          {b.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate block leading-tight">{b.title}</h4>
                      <p className="text-[10px] text-zinc-400">Origem: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{b.publisher || 'Autopublicação'}</span></p>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">Kz {b.price.toLocaleString('pt-AO')}</span>
                        {b.stock !== 999 && (
                          <span className="text-[10px] text-zinc-400 font-mono">Qtd: {b.stock} em estoque</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveSellerBook(b.id, b.title)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl cursor-pointer self-end md:self-auto shrink-0 dark:bg-rose-950/20 dark:hover:bg-rose-900/20"
                      title="Retirar Anúncio"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sem anúncios vigentes"
                description={getPortuguesePortalPlaceholder(user?.userType)}
                icon={Library}
                actionLabel="Anunciar Novo Livro"
                onAction={() => setIsAddBookOpen(true)}
              />
            )}
          </div>
        )}

        {/* T-2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-blue-500" /> Histórico de Compras e Negociações
            </h3>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-2xl border border-zinc-200 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-4"
                  >
                    {/* Header line order */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold font-mono tracking-widest uppercase block">Código do Pedido</span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 font-mono">{ord.id}</h4>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] text-zinc-400 font-bold font-mono tracking-widest uppercase block">Data do Pedido</span>
                        <p className="text-xs text-zinc-700 font-bold dark:text-zinc-300 font-mono">{ord.date}</p>
                      </div>
                      <div className="self-start sm:self-auto">
                        {getStatusBadge(ord.status)}
                      </div>
                    </div>

                    {/* list products of order items */}
                    <div className="space-y-2.5 pt-2">
                       {ord.items.map((it) => (
                        <div key={it.bookId} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-100 block leading-tight">{it.title}</span>
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-400 uppercase font-mono block mt-0.5">
                              Formato: {it.selectedFormat === 'physical' ? 'Físico' : it.selectedFormat.toUpperCase()} | Qtd: {it.quantity}
                            </span>
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">Kz {(it.price * it.quantity).toLocaleString('pt-AO')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer values breakdowns */}
                    <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex gap-4 font-mono text-zinc-600 text-[10px]">
                        <span>Imposto: Kz {ord.tax.toLocaleString('pt-AO')}</span>
                        {ord.discount > 0 && <span className="text-emerald-500">Desconto: -Kz {ord.discount.toLocaleString('pt-AO')}</span>}
                        <span>Frete: Kz {ord.shippingCharge.toLocaleString('pt-AO')}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 items-start sm:items-center">
                        {ord.trackingNumber && (
                          <p className="text-xs text-zinc-500">
                            Rastreio: <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{ord.trackingNumber}</span>
                          </p>
                        )}
                        {ord.items.some((it) => it.selectedFormat === 'physical') && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 font-semibold font-mono">
                            Previsão de Entrega: 5 a 7 dias úteis
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {ord.status === 'shipped' && ord.items.some((it) => it.selectedFormat === 'physical') && (
                          <button
                            onClick={() => showToast('Recebimento do livro confirmado com sucesso!', 'success')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition uppercase tracking-wider"
                          >
                            Confirmar Recebimento
                          </button>
                        )}
                        <div className="sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Total Pago</span>
                          <p className="font-black text-sm text-zinc-900 dark:text-zinc-50 font-mono mt-0.5">Kz {ord.total.toLocaleString('pt-AO')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Historial de compras vazio"
                description="Explore os catálogos para fechar pedidos com livrarias, editoras e vendedores parceiros."
                icon={ShoppingBag}
                actionLabel="Explorar catálogo"
                onAction={() => navigate('/catalog')}
              />
            )}
          </div>
        )}

        {/* T-3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" /> Títulos Favoritos ({wishlistBooks.length})
            </h3>

            {wishlistBooks.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {wishlistBooks.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sua lista de desejos está vazia"
                description="Marque livros com um coração ao navegar para salvá-los nesta seção instantly."
                icon={Heart}
                actionLabel="Navegar no catálogo"
                onAction={() => navigate('/catalog')}
              />
            )}
          </div>
        )}

        {/* T-4: DIGITAL LIBRARY SUMMARY */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Library className="h-4.5 w-4.5 text-blue-500" /> Minha Biblioteca Digital
              </h3>
              <Link to="/digital-library" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Leitor de PDFs & ePUBs <BookOpen className="h-4 w-4" />
              </Link>
            </div>

            {library.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {library.map((item) => {
                  const bDetails = books.find((b) => b.id === item.bookId);
                  if (!bDetails) return null;
                  return (
                    <div
                      key={item.bookId}
                      className="rounded-2xl border border-zinc-200 p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-[33px] rounded bg-gradient-to-br ${bDetails.coverColor} relative overflow-hidden flex items-center justify-center text-white font-serif font-black text-[6px] shadow-sm`}>
                          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-black/10" />
                          COV
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs text-zinc-900 truncate block leading-tight">{bDetails.title}</h4>
                          <span className="text-[10px] text-zinc-400 font-semibold font-mono uppercase mt-0.5 block">{item.format.toUpperCase()} Standard</span>
                        </div>
                      </div>

                      {/* Reading Progress indicator bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold font-mono">
                          <span>Progresso</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden dark:bg-zinc-800">
                          <div
                             className="bg-blue-600 h-full rounded-full transition-all"
                             style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        to="/digital-library"
                        className="w-full block text-center rounded-xl bg-blue-50 text-blue-600 font-bold text-xs py-2 dark:bg-zinc-800 dark:text-blue-400"
                      >
                        Abrir Leitor Digital
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Sua estante digital está vazia"
                description="Adquira e-books no formato digital para acessá-los e lê-los em nosso leitor integrado!"
                icon={Library}
                actionLabel="Explorar formatos digitais"
                onAction={() => {
                  navigate('/catalog');
                }}
              />
            )}
          </div>
        )}

      </div>

    </div>
  );
}
