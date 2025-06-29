import { Habit, HabitCompletion, PlannerActivity } from '../types/habit';

const HABITS_KEY = 'atomic-habits-tracker-habits';
const COMPLETIONS_KEY = 'atomic-habits-tracker-completions';
const PLANNER_KEY = 'atomic-habits-tracker-planner';

// Fallback to localStorage if IndexedDB fails
const isIndexedDBSupported = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

export const getHabits = async (): Promise<Habit[]> => {
  try {
    if (isIndexedDBSupported()) {
      return await getFromIndexedDB(HABITS_KEY, []);
    } else {
      const stored = localStorage.getItem(HABITS_KEY);
      return stored ? JSON.parse(stored).map((h: any) => ({
        ...h,
        createdAt: new Date(h.createdAt)
      })) : [];
    }
  } catch (error) {
    console.warn('Error getting habits from storage:', error);
    return [];
  }
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    if (isIndexedDBSupported()) {
      await saveToIndexedDB(HABITS_KEY, habits);
    } else {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    }
  } catch (error) {
    console.error('Error saving habits:', error);
  }
};

export const getCompletions = async (): Promise<HabitCompletion[]> => {
  try {
    if (isIndexedDBSupported()) {
      return await getFromIndexedDB(COMPLETIONS_KEY, []);
    } else {
      const stored = localStorage.getItem(COMPLETIONS_KEY);
      return stored ? JSON.parse(stored).map((c: any) => ({
        ...c,
        completedAt: new Date(c.completedAt)
      })) : [];
    }
  } catch (error) {
    console.warn('Error getting completions from storage:', error);
    return [];
  }
};

export const saveCompletions = async (completions: HabitCompletion[]): Promise<void> => {
  try {
    if (isIndexedDBSupported()) {
      await saveToIndexedDB(COMPLETIONS_KEY, completions);
    } else {
      localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    }
  } catch (error) {
    console.error('Error saving completions:', error);
  }
};

// Nuevas funciones para el planner
export const getPlannerActivities = async (): Promise<PlannerActivity[]> => {
  try {
    if (isIndexedDBSupported()) {
      return await getFromIndexedDB(PLANNER_KEY, []);
    } else {
      const stored = localStorage.getItem(PLANNER_KEY);
      return stored ? JSON.parse(stored).map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt)
      })) : [];
    }
  } catch (error) {
    console.warn('Error getting planner activities from storage:', error);
    return [];
  }
};

export const savePlannerActivities = async (activities: PlannerActivity[]): Promise<void> => {
  try {
    if (isIndexedDBSupported()) {
      await saveToIndexedDB(PLANNER_KEY, activities);
    } else {
      localStorage.setItem(PLANNER_KEY, JSON.stringify(activities));
    }
  } catch (error) {
    console.error('Error saving planner activities:', error);
  }
};

// IndexedDB operations
const DB_NAME = 'AtomicHabitsDB';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('data')) {
        db.createObjectStore('data');
      }
    };
  });
};

const getFromIndexedDB = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['data'], 'readonly');
    const store = transaction.objectStore('data');
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result === undefined) {
          resolve(defaultValue);
        } else {
          // Parse dates
          if (Array.isArray(result)) {
            resolve(result.map((item: any) => ({
              ...item,
              createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
              completedAt: item.completedAt ? new Date(item.completedAt) : undefined
            })));
          } else {
            resolve(result);
          }
        }
      };
    });
  } catch (error) {
    console.warn('IndexedDB error, falling back to localStorage:', error);
    throw error;
  }
};

const saveToIndexedDB = async (key: string, value: any): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');
    store.put(value, key);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('IndexedDB error, falling back to localStorage:', error);
    throw error;
  }
};