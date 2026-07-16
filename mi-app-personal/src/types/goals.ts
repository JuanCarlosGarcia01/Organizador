export interface Goal {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  completed: boolean;
  created_at: string;
}

export interface Activity {
  id: number;
  goal_id: number;
  title: string;
  completed: boolean;
  reminder_time: string | null;
  order_index: number;
}