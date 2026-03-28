import { queryClient } from '@/config/queryClient';
import { useAuthListener } from '@/features/auth/hooks';
import { useDashboardSync } from '@/features/dashboard/hooks';
import { usePushNotifications } from '@/features/notifications/hooks';
import '@/global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

function AppContent() {
    useAuthListener();
    usePushNotifications();

    // This central hook now handles:
    // 1. Initial full data sync (offline-first)
    // 2. Real-time updates for orders, requests, inquiries, conversations, and company info
    useDashboardSync();

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="auth" options={{ animation: 'none' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
            <Stack.Screen name="event" />
            <Stack.Screen name="orders/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="chat" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="requests" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <KeyboardProvider>
                    <AppContent />
                </KeyboardProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
