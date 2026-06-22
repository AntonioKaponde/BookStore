import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import { useCartStore } from '../store/useCartStore';
import { useBookStore } from '../store/useBookStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Order } from '../types';
import EmptyState from '../components/EmptyState';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart, getCartSummary, couponCode } = useCartStore();
  const { createOrder } = useBookStore();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useNotificationStore();

  const { subtotal, discount, shipping: shippingCharge, tax, total } = getCartSummary();

  // Shipping Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [street, setStreet] = useState('Avenida Comandante Valódia, nº 45');
  const [city, setCity] = useState('Luanda');
  const [state, setState] = useState('LUA');
  const [zipCode, setZipCode] = useState('0000');
  const [country, setCountry] = useState('Angola');
  const [phone, setPhone] = useState('+244 923 456 789');

  const [billingMatch, setBillingMatch] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'gplay'>('card');

  // Dummy Payment Info
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('412');

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Faça login para finalizar a compra.', 'warning');
      navigate('/login');
      return;
    }

    if (!fullName.trim() || !street.trim() || !city.trim() || !zipCode.trim() || !phone.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios do endereço.', 'warning');
      return;
    }

    setIsProcessingPayment(true);
    showToast('Processando pagamento com a sua instituição...', 'info');

    try {
      // Simulate network/payment gateway delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      const order = await createOrder({
        items: items.map((i) => ({
          bookId: i.bookId,
          selectedFormat: i.selectedFormat,
          quantity: i.quantity,
        })),
        couponCode: couponCode || undefined,
        paymentMethod,
        shippingAddress: { fullName, street, city, state, zipCode, country, phone },
      });

      // TRACK PURCHASE EVENT
      analyticsService.trackEvent({
        eventType: 'CHECKOUT_COMPLETE',
        pageUrl: window.location.pathname,
        additionalData: JSON.stringify({
          orderId: order.id,
          total,
          currency: 'AOA',
          items: items.length
        })
      });

      clearCart();
      showToast(`Pagamento aprovado! Pedido realizado com sucesso! ID: ${order.id}`, 'success', 5000);
      navigate('/dashboard', { state: { defaultTab: 'orders' } });
    } catch {
      showToast('Erro ao processar pedido. Verifique stock e tente novamente.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-sm mx-auto">
        <EmptyState
          title="Checkout Vazio"
          description="Você não possui nenhum item ativo na sua sessão de checkout. Visite nosso catálogo para adicionar edições físicas ou digitais."
          icon={ShoppingBag}
          actionLabel="Ver Catálogo"
          onAction={() => navigate('/catalog')}
        />
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10 space-y-8" id="bookverse-checkout-section">
      
      {/* FRONT PROGRESS HEADER */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 font-bold font-mono uppercase">
        <button onClick={() => navigate('/cart')} className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Carrinho
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-500">Sessão de Finalização</span>
      </div>

      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono font-bold">Validação do Pedido</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Finalização de Compra</h1>
        <p className="text-sm text-zinc-500 mt-1">Insira os dados corretos de entrega e pagamento eletrônico protegido.</p>
      </div>

      <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start" id="checkout-sheet-form">
        
        {/* SHIPPING FORM FIELDS & PAYMENT CARDS COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SHIPPING PANEL COMPONENT */}
          <div className="rounded-2xl border border-zinc-200 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600 animate-pulse" /> 1. Endereço e Destino de Entrega
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Nome de Destinatário Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Rua, Número e Bairro *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua Conselheiro Júlio de Vilhena, nº 10"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Cidade *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Luanda"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Província *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Luanda"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Código Postal (Opcional)</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="0000"
                  pattern="^[\d\-A-Z]{4,10}$"
                  maxLength={10}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">País *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Angola"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Número de Telefone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+244 923 456 789"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="billing-check"
                checked={billingMatch}
                onChange={(e) => setBillingMatch(e.target.checked)}
                className="rounded text-blue-600 h-4 w-4 cursor-pointer accent-blue-600"
              />
              <label htmlFor="billing-check" className="text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
                Endereço de cobrança idêntico ao endereço de entrega
              </label>
            </div>
          </div>

          {/* PAYMENT COMPONENT CONTAINER */}
          <div className="rounded-2xl border border-zinc-200 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" /> 2. Autorização de Pagamento Protegida
            </h3>

            {/* Selector methods */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'card', label: 'Cartão de Crédito' },
                { id: 'paypal', label: 'PayPal Log' },
                { id: 'gplay', label: 'Google Pay' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    paymentMethod === opt.id
                      ? 'border-blue-600 bg-blue-50/20 text-blue-600 dark:bg-blue-950/20'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Dynamic visual card sheet */}
            {paymentMethod === 'card' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                <div className="sm:col-span-3">
                  <label className="text-xs text-zinc- font-bold font-mono uppercase block mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    pattern="[\d ]{16,19}"
                    maxLength={19}
                    title="Insira os 16 dígitos do seu cartão"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc- font-bold font-mono uppercase block mb-1">Validade MM/AA</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                    maxLength={5}
                    title="Formato: MM/AA"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc- font-bold font-mono uppercase block mb-1">Código CVC</label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    pattern="[0-9]{3,4}"
                    maxLength={4}
                    title="Código de 3 ou 4 dígitos"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center text-xs dark:bg-zinc-950/20 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                Você será redirecionado para a autenticação externa segura correspondente ao finalizar.
              </div>
            )}
          </div>

        </div>

        {/* ITEMS & SECURED FINAL PAYMENT SUMMARY COLUMN */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="rounded-2xl border border-zinc-200 p-6 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 border-b pb-1.5 flex items-center gap-1.5">
               Revisão da Compra ({items.length} itens)
            </h3>

            {/* list summarized icons and formats */}
            <div className="space-y-3.5 max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={`${i.bookId}-${i.selectedFormat}`} className="flex items-center gap-3 justify-between border-b pb-2.5 last:border-b-0 dark:border-zinc-800">
                  <div className="flex items-center gap-2 overflow-hidden flex-1 select-none">
                    {i.book.coverImage ? (
                      <img src={i.book.coverImage} alt={i.book.title} className="h-8 w-6 rounded object-cover flex-shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800" />
                    ) : (
                      <div className={`h-8 w-6 rounded bg-gradient-to-br ${i.book.coverColor} flex-shrink-0 relative overflow-hidden flex items-center justify-center text-white font-serif font-bold text-[5px] shadow-sm`}>
                        <div className="absolute top-0 bottom-0 left-0 w-[1.5px] bg-black/10" />
                        C
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-xs text-zinc-900 truncate">{i.book.title}</h5>
                      <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-400 tracking-wider">
                        {i.quantity} x {i.selectedFormat === 'physical' ? 'Físico' : i.selectedFormat.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                    Kz {(i.book.price * i.quantity).toLocaleString('pt-AO')}
                  </span>
                </div>
              ))}
            </div>

            {/* Break-down numbers */}
            <div className="space-y-3.5 text-xs text-zinc-500 dark:text-zinc-410 font-bold border-t pt-4 border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between">
                <span>Subtotal dos Itens</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-100">Kz {subtotal.toLocaleString('pt-AO')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Desconto de Cupom</span>
                  <span className="font-mono">-Kz {discount.toLocaleString('pt-AO')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Serviço de Frete</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-100">Kz {shippingCharge.toLocaleString('pt-AO')}</span>
              </div>
              <div className="flex justify-between">
                <span>Impostos Estimados</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-100">Kz {tax.toLocaleString('pt-AO')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-900 dark:text-zinc-50 border-t pt-3.5 dark:border-zinc-800">
                <span>Valor Total</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">Kz {total.toLocaleString('pt-AO')}</span>
              </div>
            </div>

            {/* Check progress button */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition select-none uppercase tracking-wide ${
                isProcessingPayment 
                  ? 'bg-zinc-400 cursor-not-allowed dark:bg-zinc-700' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin text-zinc-100" /> Processando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-amber-400 animate-pulse" /> Finalizar & Pagar Kz {total.toLocaleString('pt-AO')}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-zinc- text-[9px] font-bold font-mono uppercase bg-zinc-100/30 p-2.5 rounded-xl dark:bg-zinc-950/20">
            <Sparkles className="h-4 w-4 text-amber-500" /> Transação Criptografada Ponta a Ponta
          </div>
        </div>

      </form>

    </div>
  );
}
