import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PlannerActivity } from '../types/habit';
import { getPlannerActivities, savePlannerActivities } from '../utils/storage';

interface PlannerState {
  activities: PlannerActivity[];
  loading: boolean;
}

type PlannerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVITIES'; payload: PlannerActivity[] }
  | { type: 'ADD_ACTIVITY'; payload: PlannerActivity }
  | { type: 'UPDATE_ACTIVITY'; payload: PlannerActivity }
  | { type: 'DELETE_ACTIVITY'; payload: string };

const plannerReducer = (state: PlannerState, action: PlannerAction): PlannerState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(a => a.id === action.payload.id ? action.payload : a)
      };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(a => a.id !== action.payload)
      };
    default:
      return state;
  }
};

interface PlannerContextType {
  state: PlannerState;
  addActivity: (activity: Omit<PlannerActivity, 'id' | 'createdAt'>) => Promise<void>;
  updateActivity: (activity: PlannerActivity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(plannerReducer, {
    activities: [],
    loading: true
  });

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const activities = await getPlannerActivities();
        console.log('Loaded activities:', activities);
        dispatch({ type: 'SET_ACTIVITIES', payload: activities });
      } catch (error) {
        console.error('Error loading planner activities:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, []);

  const addActivity = async (activityData: Omit<PlannerActivity, 'id' | 'createdAt'>) => {
    const activity: PlannerActivity = {
      ...activityData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    console.log('Adding activity:', activity);
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    
    const updatedActivities = [...state.activities, activity];
    await savePlannerActivities(updatedActivities);
    console.log('Activity saved to storage');
  };

  const updateActivity = async (activity: PlannerActivity) => {
    console.log('Updating activity:', activity);
    dispatch({ type: 'UPDATE_ACTIVITY', payload: activity });
    
    const updatedActivities = state.activities.map(a => a.id === activity.id ? activity : a);
    await savePlannerActivities(updatedActivities);
    console.log('Activity updated in storage');
  };

  const deleteActivity = async (id: string) => {
    console.log('Deleting activity:', id);
    dispatch({ type: 'DELETE_ACTIVITY', payload: id });
    
    const filteredActivities = state.activities.filter(a => a.id !== id);
    await savePlannerActivities(filteredActivities);
    console.log('Activity deleted from storage');
  };

  return (
    <PlannerContext.Provider value={{
      state,
      addActivity,
      updateActivity,
      deleteActivity
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};