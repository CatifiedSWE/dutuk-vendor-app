import React from 'react';
import {
    Modal as RNModal,
    Text,
    TouchableOpacity,
    View,
    type ModalProps as RNModalProps,
} from 'react-native';

interface ModalProps extends Omit<RNModalProps, 'children'> {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal = React.memo(function Modal({
    isVisible,
    onClose,
    title,
    children,
    ...props
}: ModalProps) {
    return (
        <RNModal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            {...props}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="max-h-[80%] rounded-t-3xl bg-surface px-6 pb-8 pt-4">
                    {/* Drag handle */}
                    <View className="mb-4 items-center">
                        <View className="h-1 w-10 rounded-full bg-gray-300" />
                    </View>

                    {/* Header */}
                    {title && (
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-gray-900">{title}</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={8}>
                                <Text className="text-base text-muted">Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {children}
                </View>
            </View>
        </RNModal>
    );
});
