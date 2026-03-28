import { useDeleteService, useServices } from '@/features/profile/hooks';
import type { Service } from '@/features/profile/types';
import { Card, Screen } from '@/shared/ui';
import { formatCurrency } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';

export default function ServicesScreen() {
    const { data: services, isLoading, refetch, isRefetching } = useServices();
    const deleteService = useDeleteService();

    const renderService = ({ item }: { item: Service }) => (
        <Card variant="outlined" className="mb-3">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                    <Text className="font-semibold text-gray-900">{item.name}</Text>
                    {item.description && (
                        <Text className="text-sm text-muted mt-1" numberOfLines={2}>{item.description}</Text>
                    )}
                    {item.price && (
                        <Text className="text-sm font-medium text-primary mt-1">
                            {item.price_type === 'starting_from' ? 'From ' : ''}
                            {formatCurrency(item.price)}
                            {item.price_type === 'hourly' ? '/hr' : item.price_type === 'per_event' ? '/event' : ''}
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => deleteService.mutate(item.id)} className="p-1">
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Services</Text>
                <View className="w-6" />
            </View>

            <FlashList
                data={services || []}
                renderItem={renderService}
                estimatedItemSize={80}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C2A2A" />}
                ListEmptyComponent={!isLoading ? (
                    <View className="items-center py-20">
                        <Ionicons name="briefcase-outline" size={48} color="#CDCDCD" />
                        <Text className="text-base text-muted mt-4">No services yet</Text>
                    </View>
                ) : null}
            />
        </Screen>
    );
}
