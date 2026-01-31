import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      setCart: (updater) => {
        set((state) => {
          const nextCart =
            typeof updater === "function" ? updater(state.cart) : updater;
          return { cart: nextCart };
        });
      },

      clearCart: () => set({ cart: [] }),

      cartCount: () =>
        get().cart.reduce((count, cartitem) => count + cartitem.quantity, 0),

      subtotal: () =>
        get().cart.reduce(
          (acc, curItem) => acc + curItem.price * curItem.quantity,
          0
        ),
    }),
    {
      name: "cart-store",
    }
  )
);
