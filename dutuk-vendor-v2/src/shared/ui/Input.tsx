import { clsx } from 'clsx';
import React, { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
    { label, error, containerClassName, className, ...props },
    ref
) {
    return (
        <View className={clsx('mb-4', containerClassName)}>
            {label && (
                <Text className="mb-1.5 text-sm font-medium text-gray-700">
                    {label}
                </Text>
            )}
            <TextInput
                ref={ref}
                className={clsx(
                    'rounded-xl border px-4 py-3 text-base text-gray-900',
                    error ? 'border-danger' : 'border-border',
                    className
                )}
                placeholderTextColor="#808080"
                {...props}
            />
            {error && (
                <Text className="mt-1 text-xs text-danger">{error}</Text>
            )}
        </View>
    );
});
