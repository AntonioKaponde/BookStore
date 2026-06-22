import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useNotificationStore } from '../store/useNotificationStore';
import EmptyState from '../components/EmptyState';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    couponCode,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    getCartSummary,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const showToast = useNotificationStore((state) => state.showToast);
  const navigate = useNavigate();

  const { subtotal, discount, shipping, tax, total, hasPhysical } = getCartSummary();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const success = await applyCoupon(promoInput);
    if (success) {
      showToast('Cupom de desconto aplicado com sucesso!', 'success');
      setPromoInput('');
    } else {
      showToast('Cupom inválido ou expirado.', 'error');
    }
  };

  const handleQuantityChange = (bookId: string, format: any, currentQty: number, change: number) => {
    updateQuantity(bookId, format, currentQty + change);
  };

  const handleCheckoutRedirect = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="py-20 max-w-xl mx-auto">
        <EmptyState
          title="Seu Carrinho de Compras está Vazio"
          description="Parece que você ainda não adicionou nenhum livro ao seu carrinho. Explore nosso catálogo de edições físicas e eBooks digitais."
          icon={ShoppingBag}
          actionLabel="Explorar Catálogo de Livros"
          onAction={() => navigate('/catalog')}
        />
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10 space-y-6" id="bookverse-cart-route">
      
      {/* HEADER SECTION */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">Sua Cesta</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Carrinho de Compras</h1>
        <p className="text-sm text-zinc-500 mt-1">Revise os livros e formatos selecionados antes de fechar o pedido.</p>
      </div>

      {/* CART CONTENT STRUCTURE */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* PRODUCT LISTINGS PANEL */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.bookId}-${item.selectedFormat}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800"
            >
              {/* Cover mini thumbnail */}
              <div className="flex items-center gap-4.5 w-full sm:w-auto">
                {item.book.coverImage ? (
                  <img src={item.book.coverImage} alt={item.book.title} className="h-16 w-12 rounded object-cover flex-shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800" />
                ) : (
                  <div className={`h-16 w-12 rounded bg-gradient-to-br ${item.book.coverColor} flex-shrink-0 relative overflow-hidden flex items-center justify-center text-white font-serif font-bold text-[8px] shadow-sm`}>
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-black/10" />
                    COV
                  </div>
                )}
                <div className="overflow-hidden flex-1 sm:flex-initial">
                  <Link to={`/book/${item.bookId}`} className="hover:text-blue-600 block">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                      {item.book.title}
                    </h4>
                  </Link>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-600 uppercase font-mono mt-1">
                    {item.selectedFormat === 'physical' ? '📕 Edição Física' : item.selectedFormat === 'pdf' ? '📄 Arquivo PDF' : '📱 eBook ePUB'}
                  </span>
                </div>
              </div>

              {/* Price / qty controllers */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-3.5 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Preço Unitário</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">Kz {item.book.price.toLocaleString('pt-AO')}</p>
                </div>

                <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-0.5 bg-zinc-50/50 dark:bg-zinc-950/30">
                  <button
                    onClick={() => handleQuantityChange(item.bookId, item.selectedFormat, item.quantity, -1)}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 active:scale-90"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold font-mono text-zinc-800 dark:text-zinc-100 select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.bookId, item.selectedFormat, item.quantity, 1)}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 active:scale-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    removeItem(item.bookId, item.selectedFormat);
                    showToast('Item removido do carrinho.', 'info');
                  }}
                  className="rounded-xl p-2 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 active:scale-95 transition dark:bg-rose-950/20 dark:border-rose-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY CART COLUMN */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-zinc-200 p-6 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b pb-1.5">Resumo do Pedido</h3>
            
            <div className="space-y-3.5 text-xs text-zinc-500 dark:text-zinc-410 font-medium">
              <div className="flex items-center justify-between">
                <span>Subtotal dos Itens</span>
                <span className="text-slate-900 dark:text-zinc-50 font-semibold font-mono">Kz {subtotal.toLocaleString('pt-AO')}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> Desconto do Cupom</span>
                  <span className="font-semibold font-mono">-Kz {discount.toLocaleString('pt-AO')}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Embalagem e Frete Estimado</span>
                {shipping > 0 ? (
                  <span className="text-slate-930 dark:text-zinc-50 font-semibold font-mono">Kz {shipping.toLocaleString('pt-AO')}</span>
                ) : (
                  <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px] font-mono">Frete Grátis</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Impostos Estimados (8%)</span>
                <span className="text-slate-933 dark:text-zinc-50 font-semibold font-mono">Kz {tax.toLocaleString('pt-AO')}</span>
              </div>

              <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-zinc-50 border-t border-zinc-200 dark:border-zinc-800 pt-3.5">
                <span>Valor Total</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">Kz {total.toLocaleString('pt-AO')}</span>
              </div>
            </div>

            {/* Promo Codes Application form */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 dark:bg-emerald-950/15 dark:border-emerald-900">
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold dark:text-emerald-500">
                    <Tag className="h-4 w-4" /> Cupom "{couponCode}" Ativo
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      showToast('Cupom removido.', 'info');
                    }}
                    className="text-xs text-rose-500 font-bold uppercase hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Cupom: MULEMBA20"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-blue-700 dark:border-zinc-800 dark:bg-zinc-950/20 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white px-4 cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              )}
            </div>

            {/* Check progress button */}
            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md cursor-pointer transition"
            >
              Ir para o Pagamento <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-zinc- text-[10px] font-bold font-mono uppercase bg-zinc-100/50 p-2.5 rounded-xl dark:bg-zinc-950/20">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Transações 100% Protegidas
          </div>
        </div>

      </div>

    </div>
  );
}
