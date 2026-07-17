import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { FoodEntry, Routine, Exercise } from '@/types/fitness';

interface FitnessStore {
  routines: Routine[];
  foodEntries: FoodEntry[];
  exercises: Exercise[];
  loading: boolean;

  loadRoutines: () => Promise<void>;
  loadFoodEntries: (date: string) => Promise<void>;
  loadExercises: (routine_id: number) => Promise<void>;

  addRoutine: (name: string, date: string, notes: string | null) => Promise<void>;
  completeRoutine: (id: number, completed: boolean) => Promise<void>;
  removeRoutine: (id: number) => Promise<void>;

  addExercise: (routine_id: number, name: string, sets: number | null, reps: number | null, weight: number | null, notes: string | null, order_index: number) => Promise<void>;
  checkExercise: (id: number, completed: boolean, routine_id: number) => Promise<void>;
  editExerciseNotes: (id: number, weight: number | null, notes: string | null, routine_id: number) => Promise<void>;
  removeExercise: (id: number, routine_id: number) => Promise<void>;

  addFoodEntry: (date: string, meal: string, description: string, calories: number | null) => Promise<void>;
  removeFoodEntry: (id: number, date: string) => Promise<void>;
}

export const useFitnessStore = create<FitnessStore>((set, get) => ({
  routines: [],
  foodEntries: [],
  exercises: [],
  loading: false,

  loadRoutines: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('routines')
      .select('*')
      .order('date', { ascending: false });
    set({ routines: data || [], loading: false });
  },

  loadFoodEntries: async (date) => {
    const { data } = await supabase
      .from('food_entries')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true });
    set({ foodEntries: data || [] });
  },

  loadExercises: async (routine_id) => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('routine_id', routine_id)
      .order('order_index', { ascending: true });
    set({ exercises: data || [] });
  },

  addRoutine: async (name, date, notes) => {
    await supabase.from('routines').insert({ name, date, notes });
    get().loadRoutines();
  },
  completeRoutine: async (id, completed) => {
    await supabase.from('routines').update({ completed }).eq('id', id);
    get().loadRoutines();
  },
  removeRoutine: async (id) => {
    await supabase.from('exercises').delete().eq('routine_id', id);
    await supabase.from('routines').delete().eq('id', id);
    get().loadRoutines();
  },

  addExercise: async (routine_id, name, sets, reps, weight, notes, order_index) => {
    await supabase.from('exercises').insert({ routine_id, name, sets, reps, weight, notes, order_index });
    get().loadExercises(routine_id);
  },
  checkExercise: async (id, completed, routine_id) => {
    await supabase.from('exercises').update({ completed }).eq('id', id);
    get().loadExercises(routine_id);
  },
  editExerciseNotes: async (id, weight, notes, routine_id) => {
    await supabase.from('exercises').update({ weight, notes }).eq('id', id);
    get().loadExercises(routine_id);
  },
  removeExercise: async (id, routine_id) => {
    await supabase.from('exercises').delete().eq('id', id);
    get().loadExercises(routine_id);
  },

  addFoodEntry: async (date, meal, description, calories) => {
    await supabase.from('food_entries').insert({ date, meal, description, calories });
    get().loadFoodEntries(date);
  },
  removeFoodEntry: async (id, date) => {
    await supabase.from('food_entries').delete().eq('id', id);
    get().loadFoodEntries(date);
  },
}));