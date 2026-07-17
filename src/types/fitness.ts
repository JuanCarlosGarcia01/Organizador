export interface FoodEntry {
  id: number;
  user_id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number | null;
  created_at: string;
}

export interface Routine {
  id: number;
  user_id: string;
  name: string;
  date: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface Exercise {
  id: number;
  routine_id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  notes: string | null;
  completed: boolean;
  order_index: number;
}