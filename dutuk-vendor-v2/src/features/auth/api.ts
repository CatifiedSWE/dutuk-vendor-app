import { supabase } from '@/services/supabase';
import type { LoginCredentials, RegisterCredentials } from './types';

/**
 * Sign in with email and password.
 */
export async function loginWithEmail({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Register a new user with email and password.
 */
export async function registerWithEmail({ email, password, fullName }: RegisterCredentials) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Initiate Google OAuth flow. Returns the auth URL.
 */
export async function initiateGoogleAuth(redirectUrl: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Exchange an authorization code for a session.
 */
export async function exchangeCodeForSession(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get the current session.
 */
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

/**
 * Get the current user.
 */
export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

/**
 * Check if a user exists by looking for their company entry.
 */
export async function checkUserExists(userId: string) {
    const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .single();

    // PGRST116 = no rows found = new user
    if (error?.code === 'PGRST116') return false;
    if (error) throw error;
    return !!data;
}

/**
 * Create the vendor role and company entry for a new user.
 */
export async function createVendorProfile(companyName?: string | null) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError || new Error('Not authenticated');

    const userId = userData.user.id;

    // Try calling the set_vendor_role RPC (if it exists)
    try {
        await supabase.rpc('set_vendor_role', { user_id: userId });
    } catch {
        // RPC may not exist, continue
    }

    // Create company entry
    const { error: insertError } = await supabase.from('companies').insert({
        user_id: userId,
        name: companyName || 'My Company',
    });

    if (insertError && insertError.code !== '23505') {
        // Ignore duplicate key (23505), throw others
        throw insertError;
    }

    return true;
}

/**
 * Update user password.
 */
export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
}
