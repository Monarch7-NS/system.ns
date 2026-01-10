
export interface MealItem {
  name: string;
  protein: number;
  kcal: number;
  quantity?: string;
}

export interface ScheduleBlock {
  id: string;
  time: string; // Display time "04:00 AM"
  startTime: number; // 24h format e.g. 400 for 4:00, 1830 for 18:30
  durationMinutes: number; // Estimated duration for the block
  title: string;
  type: 'meal' | 'activity' | 'workout';
  items: MealItem[];
  totalProtein: number;
  totalKcal: number;
}

export interface DayLog {
  completedIds: string[];
  habits: Record<string, boolean>; // e.g., { 'creatine': true }
  extraProtein: number;
  extraKcal: number;
  waterIntake: number; // in ml
  readiness: number; // 1-10 scale
}

// Maps 'YYYY-MM-DD' string to the day's full log
export type HistoryState = Record<string, DayLog>;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface HabitDef {
  id: string;
  label: string;
  icon: string; // Lucide icon name
}

export interface User {
  username: string;
  token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
  };
  token: string;
  history: HistoryState;
}
