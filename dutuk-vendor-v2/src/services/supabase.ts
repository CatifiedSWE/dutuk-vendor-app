import { env } from '@/config/env';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage adapter using expo-secure-store.
 * Tokens are stored in the device's encrypted keychain/keystore.
 */
const secureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.warn('SecureStore setItem error:', error);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.warn('SecureStore removeItem error:', error);
        }
    },
};

/**
 * Custom fetch with request timeout.
 * Storage requests get a longer timeout (30s) vs normal requests (10s).
 */
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
    const controller = new AbortController();
    const urlString = typeof url === 'string' ? url : url.toString();
    const isStorageRequest = urlString.includes('/storage/');
    const timeoutMs = isStorageRequest ? 30_000 : 10_000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, {
        ...options,
        signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
};

/**
 * Supabase client — singleton instance.
 * Uses expo-secure-store for auth token persistence.
 * Reads URL and key from validated env variables.
 */
export const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
    },
    global: {
        headers: {
            'x-client-info': 'dutuk-vendor@2.0.0',
        },
        fetch: customFetch,
    },
});
