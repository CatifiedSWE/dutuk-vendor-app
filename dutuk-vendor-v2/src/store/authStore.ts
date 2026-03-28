import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isOnboarded: boolean;

    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    setIsLoading: (loading: boolean) => void;
    setIsOnboarded: (onboarded: boolean) => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    isLoading: true,
    isOnboarded: false,

    setSession: (session) =>
        set({ session, user: session?.user ?? null }),
    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
    reset: () =>
        set({
            session: null,
            user: null,
            isLoading: false,
            isOnboarded: false,
        }),
}));
