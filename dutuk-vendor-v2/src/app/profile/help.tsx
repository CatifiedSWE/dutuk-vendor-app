import { Screen } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HelpScreen() {
    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Help Center</Text>
                <View className="w-6" />
            </View>
            <View className="flex-1 items-center justify-center">
                <Ionicons name="help-circle-outline" size={48} color="#7C2A2A" />
                <Text className="mt-4 text-base text-muted text-center">
                    Need help? Contact us at support@dutuk.com
                </Text>
            </View>
        </Screen>
    );
}
