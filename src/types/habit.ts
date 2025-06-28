export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customFrequency?: number; // veces por semana para custom
  createdAt: Date;
  isActive: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completedAt: Date;
}

export interface WeekStats {
  totalHabits: number;
  completedToday: number;
  weeklyProgress: number;
  currentStreak: number;
  longestStreak: number;
}

export interface MotivationalMessage {
  type: 'encouragement' | 'celebration' | 'gentle-reminder';
  message: string;
  emoji: string;
}