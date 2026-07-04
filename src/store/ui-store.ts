import { create } from "zustand";

interface UIState {
  /** Search overlay visibility */
  isSearchOpen: boolean;
  /** Mobile navigation menu visibility */
  isMobileMenuOpen: boolean;
  /** Cart drawer visibility */
  isCartDrawerOpen: boolean;

  // ── Actions ──
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;

  /** Close all overlays at once (useful on route change) */
  closeAll: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // ── State ──
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,

  // ── Search ──
  openSearch: () => set({ isSearchOpen: true, isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () =>
    set((state) => ({
      isSearchOpen: !state.isSearchOpen,
      isMobileMenuOpen: false,
    })),

  // ── Mobile menu ──
  openMobileMenu: () => set({ isMobileMenuOpen: true, isSearchOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
      isSearchOpen: false,
    })),

  // ── Cart drawer ──
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () =>
    set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  // ── Close all ──
  closeAll: () =>
    set({
      isSearchOpen: false,
      isMobileMenuOpen: false,
      isCartDrawerOpen: false,
    }),
}));
