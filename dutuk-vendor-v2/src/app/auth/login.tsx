import { useGoogleAuth, useLogin } from '@/features/auth/hooks';
import { Button, Input, Screen } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const loginMutation = useLogin();
    const googleAuthMutation = useGoogleAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = (data: LoginForm) => {
        loginMutation.mutate(data);
    };

    return (
        <Screen scrollable padded safeArea>
            <View className="flex-1 justify-center px-2">
                {/* Logo */}
                <View className="mb-8 items-center">
                    <Text className="text-3xl font-bold text-primary">Dutuk</Text>
                    <Text className="mt-2 text-base text-muted">Vendor Portal</Text>
                </View>

                {/* Email Login */}
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

                <Button
                    title="Sign In"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={loginMutation.isPending}
                    fullWidth
                    className="mt-2"
                />

                {/* Divider */}
                <View className="my-6 flex-row items-center">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="mx-4 text-sm text-muted">or</Text>
                    <View className="flex-1 h-px bg-border" />
                </View>

                {/* Google Login */}
                <Button
                    title="Continue with Google"
                    variant="outline"
                    onPress={() => googleAuthMutation.mutate()}
                    isLoading={googleAuthMutation.isPending}
                    fullWidth
                />

                {/* Register Link */}
                <View className="mt-8 flex-row justify-center">
                    <Text className="text-muted">Don't have an account? </Text>
                    <Link href="/auth/register" className="font-semibold text-primary">
                        Sign Up
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
