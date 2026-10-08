import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, error: null });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useCartStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity: 1, cartId: Date.now() }];
      }
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeFromCart: (cartId) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.cartId !== cartId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (cartId, quantity) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
}));

export const useProductStore = create((set) => ({
  products: [],
  filteredProducts: [],
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,

  setProducts: (products) => set({ products, filteredProducts: products }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setLoading: (isLoading) => set({ isLoading }),

  filterProducts: () => {
    set((state) => {
      let filtered = state.products;

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter((p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        );
      }

      if (state.selectedCategory) {
        filtered = filtered.filter((p) => p.category_id === state.selectedCategory);
      }

      return { filteredProducts: filtered };
    });
  },
}));
