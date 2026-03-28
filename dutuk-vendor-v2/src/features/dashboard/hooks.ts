import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { useVendorStore } from '@/store/vendorStore';
import { useEffect, useRef } from 'react';
import { fetchPastEarnings, fetchPastPayments } from '../profile/api';
import { fetchInquiries, fetchRequests } from '../requests/api';
import { fetchVendorDashboard } from './api';

// Global guard to prevent concurrent syncs
let globalSyncing = false;

/**
 * Performs the actual dashboard data fetch and store update.
 * This is NOT a hook — it's a plain async function that can be called anywhere.
 * Fetches ALL core vendor data in parallel for a full offline-first experience.
 * Incorporates individual fetch error handling for stability.
 */
export async function syncDashboard() {
    if (globalSyncing) return;
    globalSyncing = true;

    const store = useVendorStore.getState();
    const { user } = useAuthStore.getState();

    if (!user) {
        globalSyncing = false;
        return;
    }

    try {
        // Only show loading on first load (no cached data)
        if (!store.synced_at) {
            store.setLoading(true);
        }

        // Helper to run a fetch and return a fallback on failure
        const runFetch = async (promise: Promise<any>, fallback: any, name: string) => {
            try {
                return await promise;
            } catch (err: any) {
                console.warn(`Fetch [${name}] failed:`, err?.message || err);
                return fallback;
            }
        };

        // Fetch EVERYTHING in parallel
        // We use the store's current state as fallback to maintain stability even on network errors
        const [data, requests, inquiries, earnings, payments] = await Promise.all([
            runFetch(fetchVendorDashboard(), null, 'dashboard'),
            runFetch(fetchRequests(), store.requests || [], 'requests'),
            runFetch(fetchInquiries(), store.inquiries || [], 'inquiries'),
            runFetch(fetchPastEarnings(), store.earnings || [], 'earnings'),
            runFetch(fetchPastPayments(), store.payments || [], 'payments'),
        ]);

        // If core dashboard data failed, we still want to update whatever else we got
        const updateObj: any = {
            synced_at: new Date().toISOString(),
        };

        if (data) {
            Object.assign(updateObj, {
                company: data.company,
                events: data.events,
                availability: (data.availability || []).map((d: any) => ({
                    date: d.date,
                    isAvailable: d.is_available ?? d.isAvailable,
                    note: d.note
                })),
                requests_count: data.requests_count,
                inquiries_count: data.inquiries_count,
                review_stats: data.review_stats,
                recent_reviews: data.recent_reviews,
                services: data.services,
                portfolio: data.portfolio,
                orders: data.orders.map((o: any) => ({
                    id: o.id,
                    title: o.event_date || 'Untitled Order',
                    customerName: o.customer_name || 'Unknown',
                    packageType: 'Standard',
                    customerEmail: '',
                    customerPhone: '',
                    status: o.status,
                    date: new Date(o.created_at).toLocaleDateString(),
                    rawEventDate: o.event_date || o.created_at,
                    amount: o.amount,
                    notes: o.notes,
                })),
                conversations: (data.conversations || []).map((c: any) => ({
                    id: c.id,
                    customer_id: c.customer_id,
                    vendor_id: c.vendor_id,
                    last_message: c.last_message_preview || '',
                    last_message_at: c.last_message_at,
                    customer_name: c.customer_name || 'Customer',
                    customer_avatar: c.customer_avatar,
                    unread_count: 0,
                })),
            });
        }

        // Always update supplementary lists even if core dashboard failed
        updateObj.requests = requests;
        updateObj.inquiries = inquiries;
        updateObj.earnings = earnings;
        updateObj.payments = payments;

        store.setDashboardData(updateObj);
        store.setError(null);
    } catch (err: any) {
        console.warn('Dashboard sync critical failure:', err?.message);
        if (!store.synced_at) {
            store.setError(err.message);
        }
    } finally {
        store.setLoading(false);
        globalSyncing = false;
    }
}

/**
 * Root-level hook: syncs dashboard once on app start and sets up real-time listeners.
 * Should only be called ONCE in root _layout.tsx.
 */
export function useDashboardSync() {
    const { user } = useAuthStore();
    const didSyncRef = useRef(false);

    // Initial Sync
    useEffect(() => {
        if (user && !didSyncRef.current) {
            didSyncRef.current = true;
            syncDashboard();
        }
    }, [user]);

    // Global Real-time Listener for Dashboard Data
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${user.id}` }, () => syncDashboard())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_requests', filter: `vendor_id=eq.${user.id}` }, () => syncDashboard())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_inquiries', filter: `vendor_id=eq.${user.id}` }, () => syncDashboard())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'companies', filter: `user_id=eq.${user.id}` }, () => syncDashboard())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `vendor_id=eq.${user.id}` }, () => syncDashboard())
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    return { sync: syncDashboard };
}
