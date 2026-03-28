import { Screen } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function LegalScreen() {
    return (
        <Screen padded safeArea scrollable>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Legal</Text>
                <View className="w-6" />
            </View>
            <Text className="text-base text-gray-700 leading-6">
                Terms and Conditions, Privacy Policy, and other legal documents will be displayed here.
            </Text>
        </Screen>
    );
}
