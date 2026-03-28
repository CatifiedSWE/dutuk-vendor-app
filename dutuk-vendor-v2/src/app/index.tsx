import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/**
 * Root index — auth gate.
 * Redirects to tabs (authenticated + onboarded) or auth (unauthenticated).
 */
export default function Index() {
    const { session, isLoading, isOnboarded } = useAuthStore();

    useEffect(() => {
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#7C2A2A" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/auth/login" />;
    }

    if (!isOnboarded) {
        return <Redirect href="/auth/onboarding-start" />;
    }

    return <Redirect href="/(tabs)/home" />;
}
