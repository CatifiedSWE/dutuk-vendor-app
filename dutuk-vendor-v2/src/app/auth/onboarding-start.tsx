import { Button, Screen } from '@/shared/ui';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function OnboardingStartScreen() {
    return (
        <Screen padded safeArea>
            <View className="flex-1 justify-center items-center px-4">
                <Text className="text-3xl font-bold text-gray-900 text-center">
                    Welcome to Dutuk
                </Text>
                <Text className="mt-4 text-base text-muted text-center leading-6">
                    Let's set up your vendor profile so customers can find you.
                </Text>

                <View className="mt-12 w-full">
                    <Button
                        title="Get Started"
                        onPress={() => router.push('/auth/onboarding-categories')}
                        fullWidth
                        size="lg"
                    />
                </View>
            </View>
        </Screen>
    );
}
