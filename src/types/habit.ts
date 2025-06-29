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

// Nuevos tipos para el planner
export interface PlannerActivity {
  id: string;
  title: string;
  description?: string;
  color: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  days: number[]; // 0-6 (domingo a sábado)
  createdAt: Date;
  isActive: boolean;
  linkedHabitId?: string; // Nuevo: ID del hábito vinculado
}

export interface TimeSlot {
  hour: number;
  activities: PlannerActivity[];
}

export interface TodayTask {
  id: string;
  activity: PlannerActivity;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  linkedHabit?: Habit;
}