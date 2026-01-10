import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const LAST_SEEN_KEY = 'orders_last_seen_timestamp';

interface OrderNotificationContextType {
    newOrderCount: number;
    markOrdersAsSeen: () => void;
    subscriptionError: string | null;
    isLoading: boolean;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

export function OrderNotificationProvider({ children }: { children: ReactNode }) {
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string | null>(null);

    // Get user ID and load last seen timestamp on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);

                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                setUserId(user.id);

                // Load last seen timestamp from AsyncStorage
                const storedTimestamp = await AsyncStorage.getItem(`${LAST_SEEN_KEY}_${user.id}`);
                setLastSeenTimestamp(storedTimestamp);

                // Query orders created after last seen timestamp
                let query = supabase
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('vendor_id', user.id);

                if (storedTimestamp) {
                    query = query.gt('created_at', storedTimestamp);
                }

                const { count, error } = await query;

                if (error) {
                    console.error('Error fetching unseen orders count:', error);
                } else {
                    console.log('Unseen orders count:', count);
                    setNewOrderCount(count || 0);
                }
            } catch (err) {
                console.error('Error initializing order notifications:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initialize();
    }, []);

    // Subscribe to new orders (realtime)
    useEffect(() => {
        if (!userId) return;

        console.log('Setting up order notification subscription for vendor:', userId);

        const channel = supabase
            .channel(`order-notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `vendor_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('New order notification:', payload.new);
                    setNewOrderCount((prev) => prev + 1);
                }
            )
            .subscribe((status, err) => {
                console.log('Order notification subscription status:', status);
                if (status === 'CHANNEL_ERROR') {
                    console.error('Notification subscription error:', err);
                    setSubscriptionError('Failed to connect to notifications');
                } else if (status === 'SUBSCRIBED') {
                    setSubscriptionError(null);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Mark orders as seen - save current timestamp to AsyncStorage
    const markOrdersAsSeen = useCallback(async () => {
        setNewOrderCount(0);

        if (userId) {
            try {
                const now = new Date().toISOString();
                await AsyncStorage.setItem(`${LAST_SEEN_KEY}_${userId}`, now);
                setLastSeenTimestamp(now);
                console.log('Orders marked as seen at:', now);
            } catch (err) {
                console.error('Error saving last seen timestamp:', err);
            }
        }
    }, [userId]);

    return (
        <OrderNotificationContext.Provider
            value={{
                newOrderCount,
                markOrdersAsSeen,
                subscriptionError,
                isLoading,
            }}
        >
            {children}
        </OrderNotificationContext.Provider>
    );
}

export function useOrderNotifications() {
    const context = useContext(OrderNotificationContext);
    if (context === undefined) {
        throw new Error('useOrderNotifications must be used within an OrderNotificationProvider');
    }
    return context;
}
