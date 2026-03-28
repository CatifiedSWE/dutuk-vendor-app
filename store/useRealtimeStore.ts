import logger from '@/utils/logger';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from './useAuthStore';
import { Order, useVendorStore } from './useVendorStore';

let channel: any = null;

/**
 * Unified Realtime Subscription Manager
 * Replaces duplicate subscriptions in OrderNotificationContext and useOrders
 */
export function setupRealtimeSubscriptions() {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
        logger.log('Realtime setup skipped: No userId');
        return;
    }

    if (channel) {
        logger.log('Realtime setup skipped: Already subscribed');
        return;
    }

    logger.log(`Setting up unified realtime subscriptions for vendor: ${userId}`);

    channel = supabase
        .channel(`vendor-all-${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('New order received via realtime');
            const store = useVendorStore.getState();

            // Transform incoming order
            const newOrder: Order = {
                id: payload.new.id,
                title: payload.new.title,
                customerName: payload.new.customer_name,
                packageType: payload.new.package_type || 'Standard Package',
                customerEmail: payload.new.customer_email || '',
                customerPhone: payload.new.customer_phone || '',
                status: payload.new.status,
                date: payload.new.event_date ? new Date(payload.new.event_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Date TBD',
                rawEventDate: payload.new.event_date || '',
                amount: payload.new.amount,
                notes: payload.new.notes,
                isNew: true,
            };

            store.setOrders([newOrder, ...store.orders]);
            store.incrementNewOrderCount();
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('Order update received via realtime');
            useVendorStore.getState().updateOrderInStore(payload.new.id, payload.new);
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'reviews',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('New review received via realtime');
            // Refresh reviews to get updated list and stats
            useVendorStore.getState().fetchReviews(10);
        })
        .subscribe((status) => {
            logger.log(`Unified realtime status: ${status}`);
        });
}

export function teardownRealtimeSubscriptions() {
    if (channel) {
        logger.log('Tearing down realtime subscriptions');
        supabase.removeChannel(channel);
        channel = null;
    }
}
