import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = "https://unqpmwlzyaqrryzyrslf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucXBtd2x6eWFxcnJ5enlyc2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTI5ODUsImV4cCI6MjA2NDE4ODk4NX0.RwDqMBy9ctQzxG9CuVzaUlriK6M5cGycPhQviNQfcxw";

// Platform-specific storage adapter - check for SSR/Node environment
const isServerSide = typeof window === 'undefined';

// Safe storage that works in all environments including SSR
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isServerSide) return null;
    if (Platform.OS === 'web') {
      return window.localStorage?.getItem(key) ?? null;
    }
    // Dynamic import AsyncStorage only on native
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isServerSide) return;
    if (Platform.OS === 'web') {
      window.localStorage?.setItem(key, value);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (isServerSide) return;
    if (Platform.OS === 'web') {
      window.localStorage?.removeItem(key);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(key);
  },
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: !isServerSide,
    persistSession: !isServerSide,
    detectSessionInUrl: !isServerSide && Platform.OS === 'web',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': 'dutuk-frontend@1.0.0',
    },
    fetch: (url, options = {}) => {
      // Increased timeout for storage operations (30 seconds)
      const controller = new AbortController();
      const isStorageRequest = url.includes('/storage/');
      const timeoutDuration = isStorageRequest ? 30000 : 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});
