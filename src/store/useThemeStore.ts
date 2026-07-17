import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,

  init: () => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    if (isDark) document.documentElement.classList.add('dark');
    set({ isDark });
  },

  toggle: () => {
    set(state => {
      const next = !state.isDark;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return { isDark: next };
    });
  },
}));