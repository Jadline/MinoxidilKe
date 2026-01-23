import { create } from "zustand";

export const useShopStore = create((set) => ({
  selectedFilters: {
    price: [],
    category: [],
  },
  sortBy: "name-asc",
  currentPage: 1,
  itemsperPage: 6,

  setSelectedFilters: (updater) =>
    set((state) => ({
      selectedFilters:
        typeof updater === "function"
          ? updater(state.selectedFilters)
          : updater,
      // Reset to first page when filters change
      currentPage: 1,
    })),

  setsortBy: (sortBy) => set({ sortBy, currentPage: 1 }),

  setCurrentPage: (pageOrUpdater) =>
    set((state) => ({
      currentPage:
        typeof pageOrUpdater === "function"
          ? pageOrUpdater(state.currentPage)
          : pageOrUpdater,
    })),
}));
