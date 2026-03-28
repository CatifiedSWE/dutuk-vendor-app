import { useUpdateCompany } from '@/features/profile/hooks';
import { Button, Input, Screen } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

const locationSchema = z.object({
    address: z.string().min(5, 'Enter your business address'),
    city: z.string().min(2, 'Enter your city'),
});

type LocationForm = z.infer<typeof locationSchema>;

export default function OnboardingLocationScreen() {
    const updateCompany = useUpdateCompany();

    const { control, handleSubmit, formState: { errors } } = useForm<LocationForm>({
        resolver: zodResolver(locationSchema),
        defaultValues: { address: '', city: '' },
    });

    const onSubmit = async (data: LocationForm) => {
        await updateCompany.mutateAsync({
            address: data.address,
            city: data.city,
        });
        router.replace('/(tabs)/home');
    };

    return (
        <Screen scrollable padded safeArea>
            <View className="flex-1 justify-center">
                <Text className="text-2xl font-bold text-gray-900">
                    Where are you located?
                </Text>
                <Text className="mt-2 text-base text-muted mb-8">
                    This helps customers find you nearby
                </Text>

                <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Business Address"
                            placeholder="123 Main Street"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.address?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="City"
                            placeholder="Colombo"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.city?.message}
                        />
                    )}
                />

                <Button
                    title="Complete Setup"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={updateCompany.isPending}
                    fullWidth
                    size="lg"
                    className="mt-4"
                />
            </View>
        </Screen>
    );
}
