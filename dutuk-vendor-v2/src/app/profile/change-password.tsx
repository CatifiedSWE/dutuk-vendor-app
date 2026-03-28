import { usePasswordChange } from '@/features/auth/hooks';
import { Button, Input, Screen } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const passwordSchema = z
    .object({
        newPassword: z.string().min(6, 'Min 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ChangePasswordScreen() {
    const passwordChange = usePasswordChange();

    const { control, handleSubmit, formState: { errors }, reset } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const onSubmit = async (data: PasswordForm) => {
        await passwordChange.mutateAsync(data.newPassword);
        reset();
    };

    return (
        <Screen safeArea scrollable padded>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Change Password</Text>
                <View className="w-6" />
            </View>

            <View className="mt-4">
                <Controller control={control} name="newPassword" render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="New Password" placeholder="••••••••" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.newPassword?.message} />
                )} />

                <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Confirm Password" placeholder="••••••••" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.confirmPassword?.message} />
                )} />

                <Button
                    title="Update Password"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={passwordChange.isPending}
                    fullWidth
                    size="lg"
                    className="mt-4"
                />
            </View>
        </Screen>
    );
}
