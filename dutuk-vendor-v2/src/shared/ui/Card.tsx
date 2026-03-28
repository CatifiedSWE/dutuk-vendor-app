import { clsx } from 'clsx';
import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = React.memo(function Card({
    variant = 'default',
    className,
    children,
    ...props
}: CardProps) {
    return (
        <View
            className={clsx(
                'rounded-2xl p-4',
                {
                    'bg-surface': variant === 'default',
                    'border border-border bg-surface': variant === 'outlined',
                    'bg-surface shadow-md shadow-black/10': variant === 'elevated',
                },
                className
            )}
            {...props}
        >
            {children}
        </View>
    );
});
