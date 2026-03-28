import { supabase } from '@/services/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Register for push notifications and store the token in Supabase.
 */
export async function registerPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    let token: string;
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        token = tokenData.data;
    } catch (error) {
        console.warn('Failed to get push token (Firebase may not be configured):', error);
        return null;
    }

    // Store token in Supabase
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
        await supabase
            .from('push_tokens')
            .upsert({
                user_id: userData.user.id,
                token,
                platform: Platform.OS,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    return token;
}

/**
 * Remove the push notification token from Supabase.
 */
export async function unregisterPushNotifications(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
        await supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', userData.user.id);
    }
}
