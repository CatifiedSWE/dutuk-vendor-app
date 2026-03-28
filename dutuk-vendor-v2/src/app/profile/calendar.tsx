import { Screen } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
// Calendar integration placeholder - will use react-native-calendars
// import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Calendar</Text>
                <View className="w-6" />
            </View>

            <View className="flex-1 items-center justify-center">
                <Ionicons name="calendar-outline" size={48} color="#7C2A2A" />
                <Text className="mt-4 text-base text-muted text-center">
                    Calendar availability management will be integrated with react-native-calendars
                </Text>
            </View>
        </Screen>
    );
}
