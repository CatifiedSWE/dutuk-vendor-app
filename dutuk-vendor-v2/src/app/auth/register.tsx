import { useGoogleAuth, useRegister } from '@/features/auth/hooks';
import { Button, Input, Screen } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

const registerSchema = z
    .object({
        fullName: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Enter a valid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
    const registerMutation = useRegister();
    const googleAuthMutation = useGoogleAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    });

    const onSubmit = (data: RegisterForm) => {
        registerMutation.mutate(data);
    };

    return (
        <Screen scrollable padded safeArea>
            <View className="flex-1 justify-center px-2">
                <View className="mb-8 items-center">
                    <Text className="text-3xl font-bold text-primary">Create Account</Text>
                    <Text className="mt-2 text-base text-muted">Join Dutuk as a vendor</Text>
                </View>

                <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.fullName?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Email"
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.email?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Password"
                            placeholder="••••••••"
                            secureTextEntry
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.password?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            secureTextEntry
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            error={errors.confirmPassword?.message}
                        />
                    )}
                />

                <Button
                    title="Create Account"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={registerMutation.isPending}
                    fullWidth
                    className="mt-2"
                />

                <View className="my-6 flex-row items-center">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="mx-4 text-sm text-muted">or</Text>
                    <View className="flex-1 h-px bg-border" />
                </View>

                <Button
                    title="Continue with Google"
                    variant="outline"
                    onPress={() => googleAuthMutation.mutate()}
                    isLoading={googleAuthMutation.isPending}
                    fullWidth
                />

                <View className="mt-8 flex-row justify-center">
                    <Text className="text-muted">Already have an account? </Text>
                    <Link href="/auth/login" className="font-semibold text-primary">
                        Sign In
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
