import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Habit, HabitCompletion } from '../types/habit';
import { getHabits, saveHabits, getCompletions, saveCompletions } from '../utils/storage';

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
}

type HabitsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_COMPLETIONS'; payload: HabitCompletion[] }
  | { type: 'ADD_COMPLETION'; payload: HabitCompletion }
  | { type: 'REMOVE_COMPLETION'; payload: { habitId: string; date: string } };

const habitsReducer = (state: HabitsState, action: HabitsAction): HabitsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h)
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
        completions: state.completions.filter(c => c.habitId !== action.payload)
      };
    case 'SET_COMPLETIONS':
      return { ...state, completions: action.payload };
    case 'ADD_COMPLETION':
      return { ...state, completions: [...state.completions, action.payload] };
    case 'REMOVE_COMPLETION':
      return {
        ...state,
        completions: state.completions.filter(
          c => !(c.habitId === action.payload.habitId && c.date === action.payload.date)
        )
      };
    default:
      return state;
  }
};

interface HabitsContextType {
  state: HabitsState;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(habitsReducer, {
    habits: [],
    completions: [],
    loading: true
  });

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [habits, completions] = await Promise.all([
          getHabits(),
          getCompletions()
        ]);
        dispatch({ type: 'SET_HABITS', payload: habits });
        dispatch({ type: 'SET_COMPLETIONS', payload: completions });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, []);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const habit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    dispatch({ type: 'ADD_HABIT', payload: habit });
    await saveHabits([...state.habits, habit]);
  };

  const updateHabit = async (habit: Habit) => {
    dispatch({ type: 'UPDATE_HABIT', payload: habit });
    const updatedHabits = state.habits.map(h => h.id === habit.id ? habit : h);
    await saveHabits(updatedHabits);
  };

  const deleteHabit = async (id: string) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
    const filteredHabits = state.habits.filter(h => h.id !== id);
    const filteredCompletions = state.completions.filter(c => c.habitId !== id);
    await Promise.all([
      saveHabits(filteredHabits),
      saveCompletions(filteredCompletions)
    ]);
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const existingCompletion = state.completions.find(
      c => c.habitId === habitId && c.date === date
    );

    if (existingCompletion) {
      dispatch({ type: 'REMOVE_COMPLETION', payload: { habitId, date } });
      const filteredCompletions = state.completions.filter(
        c => !(c.habitId === habitId && c.date === date)
      );
      await saveCompletions(filteredCompletions);
    } else {
      const completion: HabitCompletion = {
        id: crypto.randomUUID(),
        habitId,
        date,
        completedAt: new Date()
      };
      dispatch({ type: 'ADD_COMPLETION', payload: completion });
      await saveCompletions([...state.completions, completion]);
    }
  };

  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    return state.completions.some(c => c.habitId === habitId && c.date === date);
  };

  return (
    <HabitsContext.Provider value={{
      state,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitCompletion,
      isHabitCompletedOnDate
    }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};