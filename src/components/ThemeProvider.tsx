'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { init } = useThemeStore();

  useEffect(() => {
    init();
  }, []);

  return <>{children}</>;
}