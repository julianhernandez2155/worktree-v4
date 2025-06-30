'use client';

import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * Custom hook for managing state with localStorage persistence
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is in localStorage
 * @returns [value, setValue] - Similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {
  // Always use initial value during SSR and initial render to prevent hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync with localStorage after mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setIsInitialized(true);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}