import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!product || !product._id) return;
        
        set((state) => {
          // Check if already in wishlist
          if (state.items.some((p) => p._id === product._id)) {
            return state;
          }

          return {
            items: [
              ...state.items,
              {
                _id: product._id,
                id: product.id || product._id,
                name: product.name,
                price: product.price,
                imageSrc: product.imageSrc,
                imageAlt: product.imageAlt,
                rating: product.rating,
                category: product.category,
                addedAt: Date.now(),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (p) => p._id !== productId && p.id !== productId
          ),
        }));
      },

      toggleItem: (product) => {
        const state = get();
        if (state.isInWishlist(product._id || product.id)) {
          state.removeItem(product._id || product.id);
          return false;
        } else {
          state.addItem(product);
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(
          (p) => p._id === productId || p.id === productId
        );
      },

      clearWishlist: () => set({ items: [] }),

      getCount: () => get().items.length,
    }),
    {
      name: "wishlist-storage",
    }
  )
);
