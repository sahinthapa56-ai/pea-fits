import { create } from "zustand";
import { persist } from "zustand/middleware";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CartItem {
  id: string; // client-side unique key (e.g. `${productId}-${variantId}`)
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  price: number;
  size: string | null;
  color: string | null;
  image: string | null;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncFromDB: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

type CartStore = CartState & CartActions;

// ──────────────────────────────────────────────
// Derived value helpers (pure functions)
// ──────────────────────────────────────────────

export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export { };

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // ── State ──
      items: [],
      isOpen: false,

      // ── Actions ──
      addItem: (item) => {
        const items = get().items;
        const id = item.variantId
          ? `${item.productId}-${item.variantId}`
          : item.productId;

        const existingIndex = items.findIndex((i) => i.id === id);

        if (existingIndex >= 0) {
          const updated = [...items];
          const existing = updated[existingIndex];
          const newQty = Math.min(
            existing.quantity + item.quantity,
            existing.maxQuantity,
          );
          updated[existingIndex] = { ...existing, quantity: newQty };
          set({ items: updated });
        } else {
          set({ items: [...items, { ...item, id }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
              : item,
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      syncFromDB: (items) => {
        set({ items });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "pea-fits-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
