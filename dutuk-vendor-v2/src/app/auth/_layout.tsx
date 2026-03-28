import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="callback" />
            <Stack.Screen name="onboarding-start" />
            <Stack.Screen name="onboarding-categories" />
            <Stack.Screen name="onboarding-location" />
        </Stack>
    );
}
