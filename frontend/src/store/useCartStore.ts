import { create } from 'zustand';
import { CartItem, Book } from '../types';
import { couponService } from '../services/bookService';
import { analyticsService } from '../services/analyticsService';

interface CartState {
  items: CartItem[];
  couponCode: string;
  discount: number;
  addItem: (book: Book, format: 'physical' | 'pdf' | 'epub') => void;
  removeItem: (bookId: string, format: 'physical' | 'pdf' | 'epub') => void;
  updateQuantity: (bookId: string, format: 'physical' | 'pdf' | 'epub', quantity: number) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  getCartSummary: () => {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    hasPhysical: boolean;
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  discount: 0,

  addItem: (book, format) => {
    analyticsService.trackEvent({
      eventType: 'ADD_TO_CART',
      pageUrl: window.location.pathname,
      additionalData: JSON.stringify({ bookId: book.id, title: book.title, format }),
    });

    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.bookId === book.id && item.selectedFormat === format
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += 1;
        return { items: updatedItems };
      }

      return {
        items: [...state.items, { bookId: book.id, book, quantity: 1, selectedFormat: format }],
      };
    });
  },

  removeItem: (bookId, format) => {
    set((state) => ({
      items: state.items.filter((item) => !(item.bookId === bookId && item.selectedFormat === format)),
    }));
  },

  updateQuantity: (bookId, format, quantity) => {
    if (quantity <= 0) {
      get().removeItem(bookId, format);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.bookId === bookId && item.selectedFormat === format ? { ...item, quantity } : item
      ),
    }));
  },

  applyCoupon: async (code) => {
    const formattedCode = code.trim().toUpperCase();
    const subtotal = get().items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
    try {
      const result = await couponService.validate(formattedCode, subtotal);
      if (result.valid) {
        set({ couponCode: formattedCode, discount: Number(result.discount) });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  removeCoupon: () => {
    set({ couponCode: '', discount: 0 });
  },

  clearCart: () => {
    set({ items: [], couponCode: '', discount: 0 });
  },

  getCartSummary: () => {
    const { items, couponCode, discount: storedDiscount } = get();
    const subtotal = items.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);

    const discount = couponCode ? storedDiscount : 0;
    const hasPhysical = items.some((item) => item.selectedFormat === 'physical');
    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = hasPhysical ? (afterDiscount >= 50000 ? 0 : 2000) : 0;
    const tax = afterDiscount * 0.08;
    const total = afterDiscount + shipping + tax;

    return { subtotal, discount, shipping, tax, total, hasPhysical };
  },
}));
