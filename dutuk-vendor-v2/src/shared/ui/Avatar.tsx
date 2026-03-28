import { clsx } from 'clsx';
import React from 'react';
import { Image, Text, View, type ImageSourcePropType } from 'react-native';

interface AvatarProps {
    source?: ImageSourcePropType | string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
};

const textSizeMap = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
};

export const Avatar = React.memo(function Avatar({
    source,
    name,
    size = 'md',
    className,
}: AvatarProps) {
    const initials = name
        ? name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '?';

    const imageSource =
        typeof source === 'string' ? { uri: source } : source;

    if (imageSource) {
        return (
            <Image
                source={imageSource}
                className={clsx('rounded-full', sizeMap[size], className)}
                resizeMode="cover"
            />
        );
    }

    return (
        <View
            className={clsx(
                'items-center justify-center rounded-full bg-primary/10',
                sizeMap[size],
                className
            )}
        >
            <Text className={clsx('font-bold text-primary', textSizeMap[size])}>
                {initials}
            </Text>
        </View>
    );
});
