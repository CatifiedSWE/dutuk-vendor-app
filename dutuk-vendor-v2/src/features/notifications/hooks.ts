import { useAuthStore } from '@/store/authStore';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import * as notificationsApi from './api';

/**
 * Hook to manage push notifications.
 * Registers for push tokens when user is authenticated.
 * Listens for incoming notifications.
 */
export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;

        // Register
        notificationsApi.registerPushNotifications().then(setExpoPushToken).catch(() => { });

        // Listen for notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                // Handle received notification
                console.log('Notification received:', notification.request.content.title);
            }
        );

        // Listen for notification responses (user tapped)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;
                // Handle navigation based on notification data
                console.log('Notification tapped:', data);
            }
        );

        return () => {
            // Use .remove() directly on the subscription (expo-notifications v0.28+)
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [user]);

    return { expoPushToken };
}
