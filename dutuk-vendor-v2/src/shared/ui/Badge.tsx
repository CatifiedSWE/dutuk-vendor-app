import { clsx } from 'clsx';
import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
    count: number;
    className?: string;
}

export const Badge = React.memo(function Badge({ count, className }: BadgeProps) {
    if (count <= 0) return null;

    return (
        <View
            className={clsx(
                'absolute -right-2.5 -top-1.5 min-w-[18px] items-center justify-center rounded-full bg-danger px-1',
                className
            )}
        >
            <Text className="text-[11px] font-bold text-white">
                {count > 99 ? '99+' : count}
            </Text>
        </View>
    );
});
