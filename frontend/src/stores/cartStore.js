import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      shippingCost: 0,
      selectedCity: "",

      setCart: (updater) => {
        set((state) => {
          const nextCart =
            typeof updater === "function" ? updater(state.cart) : updater;
          return { cart: nextCart };
        });
      },

      clearCart: () => set({ cart: [] }),

      setShippingCost: (shippingCost) => set({ shippingCost }),

      setSelectedCity: (selectedCity) => set({ selectedCity }),

      // Derived helpers
      cartCount: () =>
        get().cart.reduce((count, cartitem) => count + cartitem.quantity, 0),

      subtotal: () =>
        get().cart.reduce(
          (acc, curItem) => acc + curItem.price * curItem.quantity,
          0
        ),

      orderTotal: () => (get().shippingCost || 0) + get().subtotal(),
    }),
    {
      name: "cart-store",
    }
  )
);
