import { clsx } from 'clsx';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.memo(function Button({
    title,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    className,
    ...props
}: ButtonProps) {
    const containerClasses = clsx(
        'items-center justify-center rounded-xl',
        {
            'bg-primary': variant === 'primary',
            'bg-gray-100': variant === 'secondary',
            'border-2 border-primary bg-transparent': variant === 'outline',
            'bg-danger': variant === 'danger',
            'bg-transparent': variant === 'ghost',
        },
        {
            'px-4 py-2': size === 'sm',
            'px-6 py-3': size === 'md',
            'px-8 py-4': size === 'lg',
        },
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-50',
        className
    );

    const textClasses = clsx('font-semibold', {
        'text-white': variant === 'primary' || variant === 'danger',
        'text-gray-800': variant === 'secondary',
        'text-primary': variant === 'outline' || variant === 'ghost',
        'text-sm': size === 'sm',
        'text-base': size === 'md',
        'text-lg': size === 'lg',
    });

    return (
        <TouchableOpacity
            className={containerClasses}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#7C2A2A'}
                    size="small"
                />
            ) : (
                <Text className={textClasses}>{title}</Text>
            )}
        </TouchableOpacity>
    );
});
