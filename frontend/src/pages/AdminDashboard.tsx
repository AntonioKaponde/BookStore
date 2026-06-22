import React, { useState, useEffect } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useNotificationStore } from '../store/useNotificationStore';
import RatingComponent from '../components/RatingComponent';
import { Book, User } from '../types';
import { adminService } from '../services/adminService';
import { bookService } from '../services/bookService';
import {
  Settings,
  TrendingUp,
  BookOpen,
  DollarSign,
  Package,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  RotateCcw,
  Search,
  PlusCircle,
  BarChart,
  Grid,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import ModalComponent from '../components/ModalComponent';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';

export default function AdminDashboard() {
  const {
    books,
    orders,
    categories,
    authors,
    addBook,
    updateBook,
    deleteBook,
    updateOrderStatus,
    fetchAllBooks,
    fetchAdminOrders,
  } = useBookStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'books' | 'orders' | 'customers' | 'logs'>('analytics');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchAllBooks();
    fetchAdminOrders();
    loadUsers();
  }, [fetchAllBooks, fetchAdminOrders]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch {
      showToast.showToast('Erro ao carregar utilizadores.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await adminService.getSystemLogs();
      setSystemLogs(data);
    } catch {
      showToast.showToast('Erro ao carregar logs do sistema.', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Automatically load logs when tab is selected
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      showToast.showToast('Nível de acesso atualizado com sucesso.', 'success');
    } catch {
      showToast.showToast('Erro ao atualizar nível de acesso.', 'error');
    }
  };
  
  // Search state inside admin tables
  const [bookSearch, setBookSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Books CRUD Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(19.99);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAuthorId, setFormAuthorId] = useState('');
  const [formPages, setFormPages] = useState(300);
  const [formStock, setFormStock] = useState(50);
  const [formType, setFormType] = useState<'physical' | 'digital' | 'both'>('both');
  const [formIsbn, setFormIsbn] = useState('978-3-16-148410-0');
  const [formPublisher, setFormPublisher] = useState('Editora Mulemba');

  // File Upload States
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormDescription('');
    setFormPrice(19.99);
    setFormCategoryId(categories.length > 0 ? categories[0].id : '');
    setFormAuthorId(authors.length > 0 ? authors[0].id : '');
    setFormPages(300);
    setFormStock(50);
    setFormType('both');
    setFormIsbn('978-3-16-148410-0');
    setFormPublisher('Editora Mulemba');
    setCoverFile(null);
    setEbookFile(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormTitle(book.title);
    setFormDescription(book.description);
    setFormPrice(book.price);
    setFormCategoryId(book.categoryId);
    setFormAuthorId(book.authorId);
    setFormPages(book.pages);
    setFormStock(book.stock);
    setFormType(book.type);
    setFormIsbn(book.isbn || '978-3-16-148410-0');
    setFormPublisher(book.publisher || 'Editora Mulemba');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast.showToast('Por favor, preencha o título e as descrições de sinopse necessárias.', 'warning');
      return;
    }

    setIsUploading(true);

    try {
      let coverImageUrl = editingBook?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=450&auto=format&fit=crop&q=80';
      let ebookUrl = editingBook?.ebookFileUrl;

      if (coverFile) {
        showToast.showToast('Enviando capa do livro...', 'info');
        coverImageUrl = await bookService.uploadFile(coverFile);
      }

      if (ebookFile) {
        showToast.showToast('Enviando ficheiro PDF/EPUB...', 'info');
        ebookUrl = await bookService.uploadFile(ebookFile);
      }

      const newBookData = {
        title: formTitle,
        description: formDescription,
        price: formPrice,
        categoryId: formCategoryId,
        authorId: formAuthorId,
        coverColor: 'from-blue-600 to-indigo-805',
        coverImage: coverImageUrl,
        ebookFileUrl: ebookUrl,
        type: formType,
        formats: formType === 'both' ? ['physical', 'pdf', 'epub'] : formType === 'physical' ? ['physical'] : ['pdf', 'epub'],
        stock: formType === 'digital' ? 999 : formStock,
        pages: formPages,
        publishedDate: new Date().toISOString().split('T')[0],
        isbn: formIsbn,
        publisher: formPublisher,
      } as Omit<Book, 'id'>;

      if (editingBook) {
        await updateBook(editingBook.id, newBookData);
        showToast.showToast(`Valores do catálogo de "${formTitle}" atualizados com sucesso!`, 'success');
      } else {
        await addBook(newBookData);
        showToast.showToast(`Nova publicação "${formTitle}" cadastrada em nosso catálogo!`, 'success');
      }
      setIsAddModalOpen(false);
    } catch {
      showToast.showToast('Erro ao guardar livro ou carregar ficheiros.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (confirm(`Tem certeza absoluta de que deseja excluir "${title}"?`)) {
      try {
        await deleteBook(id);
        showToast.showToast(`"${title}" foi removido do catálogo com sucesso.`, 'info');
      } catch {
        showToast.showToast('Erro ao eliminar livro.', 'error');
      }
    }
  };

  // Filter lists inside admin pages
  const bookList = books.filter((b) =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (b.isbn && b.isbn.includes(bookSearch))
  );

  const orderList = orders.filter((o) =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Calculations for Analytics dashboard
  const statsRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const statsSoldItemsCount = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.items.length : 0), 0);
  const statsLowStockBooks = books.filter((b) => b.stock < 10).length;

  return (
    <div className="py-6 md:py-10 space-y-8" id="bookverse-admin-panel">
      
      {/* HEADER ROW */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 font-mono">Console de Operações</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Painel Geral do Administrador</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie estoques físicos de livrarias, controle o envio de pedidos e monitore as estatísticas financeiras.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-3 cursor-pointer shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" /> Cadastrar Novo Livro
        </button>
      </div>

      {/* CORE ADMINISTRATIVE TABS */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { id: 'analytics', label: 'Painel & Métricas', icon: BarChart },
          { id: 'books', label: 'Estoque de Livros', icon: BookOpen },
          { id: 'orders', label: 'Controle de Envios', icon: Package },
          { id: 'customers', label: 'Contas Cadastradas', icon: Users },
          { id: 'logs', label: 'Monitor de Sistema', icon: Terminal },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none ${
                activeTab === tab.id
                  ? 'border-emerald-600 bg-emerald-600/10 text-emerald-600 dark:text-emerald-410 font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-200'
              }`}
            >
              <TabIcon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE MENU */}
      <div className="py-1 animate-fade-in" id="admin-panel-tabs-manifest">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsDashboard />
          </div>
        )}

        {/* TAB 2: BOOKS INVENTORY TAB TABLE OVERVIEW */}
        {activeTab === 'books' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex items-center max-w-sm w-full">
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Buscar livros, código ISBN..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 pl-9 text-xs outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
              </div>
              
              <button
                onClick={handleOpenAddModal}
                className="rounded-xl border border-dashed border-zinc-300 py-2.5 px-4 text-xs font-bold text-zinc-700 hover:bg-zinc-50 inline-flex items-center gap-1 cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <Plus className="h-4 w-4 text-emerald-550" /> Conectar novos títulos literários
              </button>
            </div>

            {/* List Table items */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-200 uppercase tracking-widest text-[9px] font-mono font-bold text-zinc-400 dark:bg-zinc-950/20 dark:border-zinc-800">
                    <th className="px-5 py-3">Especificações do Livro</th>
                    <th className="px-5 py-3">Formato / Edição</th>
                    <th className="px-5 py-3 font-mono">Preço</th>
                    <th className="px-5 py-3 font-mono">Em Estoque</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {bookList.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        {b.coverImage ? (
                          <img src={b.coverImage} alt={b.title} className="h-11 w-8 rounded object-cover flex-shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800" />
                        ) : (
                          <div className={`h-11 w-8 rounded bg-gradient-to-br ${b.coverColor} flex-shrink-0 relative overflow-hidden flex items-center justify-center text-white font-serif font-bold text-[6px] shadow-sm`}>
                            <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-black/10" />
                            BOV
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <span className="font-bold text-zinc-900 dark:text-zinc-50 block leading-tight truncate max-w-xs">{b.title}</span>
                          <span className="text-[10px] text-zinc- block font-mono mt-0.5">ISBN: {b.isbn || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                          {b.type === 'both' ? 'Físico + Digital' : b.type === 'physical' ? 'Físico' : 'Digital'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">Kz {b.price.toLocaleString('pt-AO')}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono font-bold ${b.stock < 10 ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-400'}`}>
                          {b.type === 'digital' ? 'Infinito (Digital)' : b.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5 flex justify-end items-center h-full">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 rounded-lg border hover:bg-zinc-100 text-zinc-500 active:scale-95 dark:border-zinc-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="p-1.5 rounded-lg border hover:bg-rose-50 text-rose-600 active:scale-95 dark:border-zinc-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS DISPATCH MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="relative flex items-center max-w-sm w-full">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Buscar pedidos por código ou nome..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 pl-9 text-xs outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-200 uppercase tracking-widest text-[9px] font-mono font-bold text-zinc-400 dark:bg-zinc-950/20 dark:border-zinc-800">
                    <th className="px-5 py-3 font-mono">Código do Pedido</th>
                    <th className="px-5 py-3">Nome do Cliente</th>
                    <th className="px-5 py-3">Obras Adquiridas</th>
                    <th className="px-5 py-3 font-mono">Valor Bruto</th>
                    <th className="px-5 py-3">Status de Envio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {orderList.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      <td className="px-5 py-3 text-sm font-black text-blue-700 dark:text-blue-400 font-mono">{ord.id}</td>
                      <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{ord.shippingAddress.fullName}</td>
                      <td className="px-5 py-3 max-w-xs truncate text-[11px] text-zinc-500">
                        {ord.items.map((i) => `${i.title} (${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-5 py-3 font-bold font-mono text-zinc-900 dark:text-zinc-100">Kz {ord.total.toLocaleString('pt-AO')}</td>
                      <td className="px-5 py-3">
                        <select
                          value={ord.status}
                          onChange={(e: any) => {
                            updateOrderStatus(ord.id, e.target.value);
                            showToast.showToast(`Status do pedido atualizado: ${ord.id}`, 'info');
                          }}
                          className="rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none focus:border-emerald-600 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-bold text-zinc-800"
                        >
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS LOG PANEL */}
        {activeTab === 'customers' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-600 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-550" /> Gestão de Utilizadores e Permissões
            </h3>

            {loadingUsers ? (
              <div className="p-10 text-center text-xs text-zinc-500 animate-pulse">Carregando utilizadores...</div>
            ) : (
              <div className="space-y-3.5">
                {users.map((u) => (
                  <div key={u.id} className="flex flex-col sm:flex-row justify-between sm:items-center text-xs p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"}
                        alt="client"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                          {u.name}
                          {u.role === 'admin' && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                        </h5>
                        <span className="text-[10px] text-zinc-400 font-mono">{u.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-50 text-sky-700 px-2.5 py-0.5 text-[9px] font-bold font-mono uppercase dark:bg-zinc-900 dark:text-sky-400 border border-sky-100 mr-2">
                        {u.userType || 'Cliente'}
                      </span>
                      
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold outline-none font-mono tracking-wider ${
                          u.role === 'admin' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        <option value="user">USER (Normal)</option>
                        <option value="admin">ADMIN (Acesso Total)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SYSTEM LOGS TERMINAL */}
        {activeTab === 'logs' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-600 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-550" /> Consola de Logs do Sistema
              </h3>
              <button
                onClick={loadLogs}
                disabled={loadingLogs}
                className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? 'animate-spin' : ''}`} /> Atualizar Logs
              </button>
            </div>

            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 h-[450px] overflow-y-auto font-mono text-[11px] shadow-inner relative custom-scrollbar">
              {loadingLogs && systemLogs.length === 0 ? (
                <div className="text-emerald-500 animate-pulse">Estabelecendo conexão com o servidor de logs...</div>
              ) : (
                <div className="space-y-1.5">
                  {systemLogs.map((log, index) => {
                    // Extract colors based on log level
                    let colorClass = "text-zinc-400";
                    if (log.includes(" INFO ")) colorClass = "text-sky-400";
                    if (log.includes(" WARN ")) colorClass = "text-amber-400";
                    if (log.includes(" ERROR ")) colorClass = "text-rose-500";
                    if (log.includes(" REST: ")) colorClass = "text-emerald-400 font-bold";
                    
                    return (
                      <div key={index} className={`break-words ${colorClass}`}>
                        <span className="opacity-50 select-none mr-2">{index + 1}</span> {log}
                      </div>
                    );
                  })}
                  {systemLogs.length === 0 && (
                    <div className="text-zinc-500 italic">Nenhum log disponível ou o ficheiro está vazio.</div>
                  )}
                  <div className="text-emerald-500 animate-pulse mt-2">_</div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 text-right">Mostrando as últimas linhas gravadas no sistema (Max 200).</p>
          </div>
        )}

      </div>

      {/* BOOKS ADD AND EDIT OVERLAY MODAL */}
      <ModalComponent
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingBook ? `Editar Detalhes de: "${formTitle}"` : 'Cadastrar Nova Obra Literária'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="sm:col-span-2">
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Título do Livro *</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Arquitetura de Sistemas Cognitivos"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Sinopse / Descrição da Obra *</label>
            <textarea
              required
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Sinopse do autor, sumário, capítulos e temas centrais da obra..."
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Preço (Kz) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formPrice}
              onChange={(e) => setFormPrice(parseFloat(e.target.value))}
              placeholder="19.99"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Formatos Disponibilizados</label>
            <select
              value={formType}
              onChange={(e: any) => setFormType(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-bold text-zinc-800"
            >
              <option value="both">Ambos (Físico + Digital)</option>
              <option value="physical">Apenas Físico</option>
              <option value="digital">Apenas Digital (eBook)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Código da Categoria</label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-bold text-zinc-800"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Escritor / Autor</label>
            <select
              value={formAuthorId}
              onChange={(e) => setFormAuthorId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-bold text-zinc-800"
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Capa do Livro (Imagem)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-bold text-zinc-800 text-xs"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Ficheiro Digital (PDF/EPUB)</label>
            <input
              type="file"
              accept=".pdf,.epub"
              onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-bold text-zinc-800 text-xs"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Número de Páginas</label>
            <input
              type="number"
              required
              value={formPages}
              onChange={(e) => setFormPages(parseInt(e.target.value))}
              placeholder="320"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Estoque do Livro Físico</label>
            <input
              type="number"
              required
              disabled={formType === 'digital'}
              value={formType === 'digital' ? 999 : formStock}
              onChange={(e) => setFormStock(parseInt(e.target.value))}
              placeholder="50"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-emerald-700 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Código ISBN da Edição *</label>
            <input
              type="text"
              required
              value={formIsbn}
              onChange={(e) => setFormIsbn(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold font-mono uppercase block mb-1">Editora Responsável *</label>
            <input
              type="text"
              required
              value={formPublisher}
              onChange={(e) => setFormPublisher(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isUploading ? (
                <>Enviando Ficheiros...</>
              ) : (
                <>{editingBook ? 'Salvar Edição' : 'Cadastrar Obra'}</>
              )}
            </button>
          </div>
        </form>
      </ModalComponent>

    </div>
  );
}
