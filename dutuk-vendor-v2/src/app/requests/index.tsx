import { useAcceptRequest, useRejectRequest, useRequests } from '@/features/requests/hooks';
import type { Request } from '@/features/requests/types';
import { Button, Card, Screen } from '@/shared/ui';
import { formatCurrency, formatDate } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';

export default function RequestsScreen() {
    const { data: requests, isLoading, refetch, isRefetching } = useRequests();
    const acceptRequest = useAcceptRequest();
    const rejectRequest = useRejectRequest();

    const renderRequest = ({ item }: { item: Request }) => (
        <Card variant="outlined" className="mb-3">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                    <Text className="font-semibold text-gray-900">{item.event_type}</Text>
                    <Text className="text-sm text-muted mt-1">{item.customer_name}</Text>
                    <Text className="text-xs text-muted mt-0.5">
                        {formatDate(item.event_date)}
                        {item.location ? ` · ${item.location}` : ''}
                    </Text>
                    {item.budget && (
                        <Text className="text-sm font-medium text-primary mt-1">
                            Budget: {formatCurrency(item.budget)}
                        </Text>
                    )}
                </View>
                <View className={`rounded-full px-3 py-1 ${item.status === 'pending' ? 'bg-warning/10' :
                        item.status === 'accepted' ? 'bg-success/10' : 'bg-danger/10'
                    }`}>
                    <Text className={`text-xs font-medium capitalize ${item.status === 'pending' ? 'text-warning' :
                            item.status === 'accepted' ? 'text-success' : 'text-danger'
                        }`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {item.status === 'pending' && (
                <View className="flex-row gap-3 mt-3 pt-3 border-t border-border">
                    <Button
                        title="Accept"
                        size="sm"
                        className="flex-1"
                        onPress={() => acceptRequest.mutate(item.id)}
                    />
                    <Button
                        title="Reject"
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onPress={() => rejectRequest.mutate(item.id)}
                    />
                </View>
            )}
        </Card>
    );

    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Requests</Text>
                <View className="w-6" />
            </View>

            <FlashList
                data={requests || []}
                renderItem={renderRequest}
                estimatedItemSize={120}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C2A2A" />}
                ListEmptyComponent={!isLoading ? (
                    <View className="items-center py-20">
                        <Ionicons name="mail-outline" size={48} color="#CDCDCD" />
                        <Text className="text-base text-muted mt-4">No requests yet</Text>
                    </View>
                ) : null}
            />
        </Screen>
    );
}
