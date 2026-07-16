import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Goal, Activity } from '@/types/goals';

interface GoalsStore {
  goals: Goal[];
  activities: Activity[];
  loading: boolean;

  loadGoals: () => Promise<void>;
  loadActivities: (goal_id: number) => Promise<void>;

  addGoal: (title: string, description: string | null, deadline: string | null) => Promise<void>;
  completeGoal: (id: number, completed: boolean) => Promise<void>;
  removeGoal: (id: number) => Promise<void>;

  addActivity: (goal_id: number, title: string, reminder_time: string | null, order_index: number) => Promise<void>;
  checkActivity: (id: number, completed: boolean, goal_id: number) => Promise<void>;
  setReminder: (id: number, reminder_time: string | null, goal_id: number) => Promise<void>;
  removeActivity: (id: number, goal_id: number) => Promise<void>;
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
  goals: [],
  activities: [],
  loading: false,

  loadGoals: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });
    set({ goals: data || [], loading: false });
  },

  loadActivities: async (goal_id) => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('goal_id', goal_id)
      .order('order_index', { ascending: true });
    set({ activities: data || [] });
  },

  addGoal: async (title, description, deadline) => {
    await supabase.from('goals').insert({ title, description, deadline });
    get().loadGoals();
  },
  completeGoal: async (id, completed) => {
    await supabase.from('goals').update({ completed }).eq('id', id);
    get().loadGoals();
  },
  removeGoal: async (id) => {
    await supabase.from('activities').delete().eq('goal_id', id);
    await supabase.from('goals').delete().eq('id', id);
    get().loadGoals();
  },

  addActivity: async (goal_id, title, reminder_time, order_index) => {
    await supabase.from('activities').insert({ goal_id, title, reminder_time, order_index });
    get().loadActivities(goal_id);
  },
  checkActivity: async (id, completed, goal_id) => {
    await supabase.from('activities').update({ completed }).eq('id', id);
    get().loadActivities(goal_id);
  },
  setReminder: async (id, reminder_time, goal_id) => {
    await supabase.from('activities').update({ reminder_time }).eq('id', id);
    get().loadActivities(goal_id);
  },
  removeActivity: async (id, goal_id) => {
    await supabase.from('activities').delete().eq('id', id);
    get().loadActivities(goal_id);
  },
}));