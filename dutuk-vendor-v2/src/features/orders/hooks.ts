import { supabase } from '@/services/supabase';
import { useUIStore } from '@/store/uiStore';
import { useVendorStore } from '@/store/vendorStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { syncDashboard } from '../dashboard/hooks';
import * as ordersApi from './api';

const ORDERS_KEY = ['orders'];

/**
 * Hook to fetch and manage vendor orders.
 * Reads from store for offline-first performance.
 */
export function useOrders() {
    const orders = useVendorStore((state) => state.orders);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        orders,
        isLoading,
        isRefreshing: isLoading,
        error: null,
        refetch: syncDashboard,
    };
}

export function useOrderById(orderId: string) {
    return useQuery({
        queryKey: [...ORDERS_KEY, orderId],
        queryFn: () => ordersApi.getOrderById(orderId),
        enabled: !!orderId,
    });
}

/**
 * Hook to update an order's status (approve/reject).
 */
export function useUpdateOrderStatus() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: 'approved' | 'rejected' }) =>
            ordersApi.updateOrderStatus(orderId, status),
        onSuccess: (_, { status }) => {
            syncDashboard();
            showToast({
                type: 'success',
                title: `Order ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Update Failed', message: error.message });
        },
    });
}

/**
 * Hook to track new/unseen order count for notification badge.
 * Subscribes to real-time changes on the bookings table.
 */
export function useOrdersRealtime() {
    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;

        const setupSubscription = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            // Instead of manually updating the store array (which involves complex joins
            // and transforms), we trigger a dashboard sync when any booking changes.
            // This ensures data consistency with the backend's transform logic.
            channel = supabase
                .channel('order-updates')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // INSERT, UPDATE, DELETE
                        schema: 'public',
                        table: 'orders',
                        filter: `vendor_id=eq.${userData.user.id}`,
                    },
                    () => {
                        syncDashboard();
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            channel?.unsubscribe();
        };
    }, []);
}

export function useOrderNotifications() {
    const [newOrderCount, setNewOrderCount] = useState(0);

    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;

        const setupSubscription = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            channel = supabase
                .channel('order-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'orders',
                        filter: `vendor_id=eq.${userData.user.id}`,
                    },
                    () => {
                        setNewOrderCount((prev) => prev + 1);
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            channel?.unsubscribe();
        };
    }, []);

    const markOrdersAsSeen = useCallback(() => setNewOrderCount(0), []);

    return { newOrderCount, markOrdersAsSeen };
}
