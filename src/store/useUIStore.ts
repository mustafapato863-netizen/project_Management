import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme, ProjectFilters, ProjectSort } from "@/types";

interface UIStore {
  theme: Theme;
  filters: ProjectFilters;
  sort: ProjectSort;
  sidebarOpen: boolean;

  // Theme
  setTheme: (theme: Theme) => void;

  // Filters & Sort
  setFilters: (filters: ProjectFilters) => void;
  resetFilters: () => void;
  setSort: (sort: ProjectSort) => void;

  // UI State
  setSidebarOpen: (open: boolean) => void;
}

const defaultFilters: ProjectFilters = {
  status: undefined,
  category: undefined,
  priority: undefined,
  searchQuery: "",
};

const defaultSort: ProjectSort = {
  field: "createdAt",
  direction: "desc",
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "light",
      filters: defaultFilters,
      sort: defaultSort,
      sidebarOpen: true,

      setTheme: (theme) => set({ theme }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () =>
        set({
          filters: defaultFilters,
          sort: defaultSort,
        }),

      setSort: (sort) => set({ sort }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "ui-store",
      version: 1,
    },
  ),
);
