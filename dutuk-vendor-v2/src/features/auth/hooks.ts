import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useVendorStore } from '@/store/vendorStore';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import * as authApi from './api';
import type { LoginCredentials, RegisterCredentials } from './types';

WebBrowser.maybeCompleteAuthSession();

/**
 * Hook to listen for auth state changes and update the global store.
 * Should be called once in the root layout.
 */
export function useAuthListener() {
    const { setSession, setIsLoading, setIsOnboarded } = useAuthStore();

    useEffect(() => {
        // Use onAuthStateChange as the single source of truth.
        // INITIAL_SESSION fires immediately with the existing session (or null),
        // so we never need a separate getSession() call. This avoids the race
        // condition where init() and the listener both update state concurrently,
        // causing index.tsx to redirect to the wrong screen.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);

                if (session) {
                    try {
                        const exists = await authApi.checkUserExists(session.user.id);
                        setIsOnboarded(exists);
                    } catch (error) {
                        console.error('Auth state change error:', error);
                        setIsOnboarded(false);
                    }
                } else {
                    setIsOnboarded(false);
                }

                // Mark loading complete after first event (INITIAL_SESSION)
                if (event === 'INITIAL_SESSION') {
                    setIsLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [setSession, setIsLoading, setIsOnboarded]);
}

/**
 * Hook for email/password login.
 */
export function useLogin() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.loginWithEmail(credentials),
        onSuccess: () => {
            showToast({ type: 'success', title: 'Welcome Back!', message: 'Successfully signed in.' });
            router.replace('/(tabs)/home');
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Login Failed', message: error.message });
        },
    });
}

/**
 * Hook for email/password registration.
 */
export function useRegister() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (credentials: RegisterCredentials) => authApi.registerWithEmail(credentials),
        onSuccess: () => {
            showToast({ type: 'success', title: 'Account Created', message: 'Welcome to Dutuk!' });
            router.replace('/auth/onboarding-start');
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Registration Failed', message: error.message });
        },
    });
}

/**
 * Hook for Google OAuth login.
 */
export function useGoogleAuth() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: async () => {
            const redirectUrl = 'dutukfrontend://auth/callback';
            console.log('[GoogleAuth] Using Redirect URL:', redirectUrl);

            const data = await authApi.initiateGoogleAuth(redirectUrl);

            if (!data?.url) throw new Error('No auth URL returned');

            console.log('[GoogleAuth] Opening Auth Session with URL:', data.url);
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type !== 'success' || !result.url) {
                if (result.type === 'cancel') {
                    throw new Error('Sign-in was cancelled');
                }
                throw new Error('Authentication failed');
            }

            // Extract the authorization code from the redirect URL
            const url = new URL(result.url);
            const code = url.searchParams.get('code');

            if (!code) {
                console.error('[GoogleAuth] No code in redirect URL:', result.url);
                throw new Error('No authorization code received');
            }

            console.log('[GoogleAuth] Received code, exchanging for session...');
            const sessionData = await authApi.exchangeCodeForSession(code);
            const session = sessionData?.session;

            if (!session) throw new Error('Failed to establish session');

            const userId = session.user.id;
            const isExistingUser = await authApi.checkUserExists(userId);

            if (!isExistingUser) {
                const googleName =
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    null;

                await authApi.createVendorProfile(googleName);
                return { isNewUser: true };
            }

            return { isNewUser: false };
        },
        onSuccess: ({ isNewUser }) => {
            console.log('[GoogleAuth] Success! isNewUser:', isNewUser);
            if (isNewUser) {
                showToast({ type: 'success', title: 'Welcome to Dutuk!', message: 'Your vendor account has been created.' });
                router.replace('/auth/onboarding-start');
            } else {
                showToast({ type: 'success', title: 'Welcome Back!', message: 'Successfully signed in.' });
                router.replace('/(tabs)/home');
            }
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Google Sign-In Failed', message: error.message });
        },
    });
}

/**
 * Hook for signing out.
 */
export function useLogout() {
    const { reset: resetAuth } = useAuthStore();
    const { reset: resetVendor } = useVendorStore();
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: authApi.signOut,
        onSuccess: () => {
            resetAuth();
            resetVendor();
            router.replace('/');
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Logout Failed', message: error.message });
        },
    });
}

/**
 * Hook for password change.
 */
export function usePasswordChange() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (newPassword: string) => authApi.updatePassword(newPassword),
        onSuccess: () => {
            showToast({ type: 'success', title: 'Password Updated', message: 'Your password has been changed.' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Update Failed', message: error.message });
        },
    });
}
