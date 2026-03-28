import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileSubLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="edit" />
            <Stack.Screen name="services" />
            <Stack.Screen name="portfolio" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="reviews" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="help" />
            <Stack.Screen name="legal" />
        </Stack>
    );
}
