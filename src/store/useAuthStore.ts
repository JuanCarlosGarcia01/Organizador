import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/auth';

interface AuthStore {
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  profile: null,
  isAuthenticated: false,
  loading: true,

  loadSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({ profile, isAuthenticated: true, loading: false });
    } else {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Email o contraseña incorrectos' };
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    set({ profile, isAuthenticated: true });
    return { success: true };
  },

  register: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Error al crear usuario' };
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name });
    if (profileError) return { success: false, error: 'Error al crear perfil' };
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    set({ profile, isAuthenticated: true });
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ profile: null, isAuthenticated: false });
  },
}));