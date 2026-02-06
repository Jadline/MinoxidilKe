import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 10;

export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!product || !product._id) return;
        
        set((state) => {
          // Remove if already exists (to move to front)
          const filtered = state.items.filter((p) => p._id !== product._id);
          
          // Add to front and limit to max items
          const newItems = [
            {
              _id: product._id,
              id: product.id || product._id,
              name: product.name,
              price: product.price,
              imageSrc: product.imageSrc,
              imageAlt: product.imageAlt,
              rating: product.rating,
              category: product.category,
              viewedAt: Date.now(),
            },
            ...filtered,
          ].slice(0, MAX_RECENTLY_VIEWED);

          return { items: newItems };
        });
      },

      clearItems: () => set({ items: [] }),

      getItems: () => get().items,
    }),
    {
      name: "recently-viewed-storage",
    }
  )
);
