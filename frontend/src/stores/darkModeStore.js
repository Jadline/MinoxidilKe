import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDarkModeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: "admin-dark-mode",
    }
  )
);
