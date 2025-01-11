import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("flashTheme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("flashTheme", theme);
    set({ theme });
  },
}));