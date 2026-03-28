import { Button, Screen } from '@/shared/ui';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIES = [
    'Photography', 'Videography', 'DJ / Music',
    'Catering', 'Decoration', 'Venue',
    'Wedding Planning', 'Makeup & Hair', 'Entertainment',
    'Sound & Lighting', 'Transportation', 'Other',
];

export default function OnboardingCategoriesScreen() {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleCategory = (category: string) => {
        setSelected((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    return (
        <Screen padded safeArea>
            <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mt-4">
                    What do you specialize in?
                </Text>
                <Text className="mt-2 text-base text-muted">
                    Select all that apply
                </Text>

                <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap gap-3">
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => toggleCategory(cat)}
                                className={`rounded-full px-5 py-3 border ${selected.includes(cat)
                                        ? 'bg-primary border-primary'
                                        : 'bg-surface border-border'
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-medium ${selected.includes(cat) ? 'text-white' : 'text-gray-700'
                                        }`}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <Button
                    title="Continue"
                    onPress={() => router.push('/(auth)/onboarding-location')}
                    disabled={selected.length === 0}
                    fullWidth
                    size="lg"
                    className="mb-4"
                />
            </View>
        </Screen>
    );
}
