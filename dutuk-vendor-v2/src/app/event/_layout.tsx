import { Stack } from 'expo-router';
import React from 'react';

export default function EventLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="manage/[id]" />
            <Stack.Screen name="manage/create" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
