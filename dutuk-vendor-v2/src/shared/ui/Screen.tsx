import { clsx } from 'clsx';
import React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
    scrollable?: boolean;
    padded?: boolean;
    safeArea?: boolean;
}

export const Screen = React.memo(function Screen({
    scrollable = false,
    padded = true,
    safeArea = true,
    className,
    children,
    ...props
}: ScreenProps) {
    const Wrapper = safeArea ? SafeAreaView : View;
    const content = (
        <View
            className={clsx('flex-1', padded && 'px-4', className)}
            {...props}
        >
            {children}
        </View>
    );

    return (
        <Wrapper className="flex-1 bg-background">
            {scrollable ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {content}
                </ScrollView>
            ) : (
                content
            )}
        </Wrapper>
    );
});
