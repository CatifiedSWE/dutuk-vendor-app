import { useAllEvents } from '@/features/events/hooks';
import type { Event } from '@/features/events/types';
import { Button, Card, Screen } from '@/shared/ui';
import { formatDate } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';

export default function EventsIndexScreen() {
    const { data: events, isLoading, refetch } = useAllEvents();

    const renderEvent = ({ item }: { item: Event }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}
        >
            <Card variant="outlined" className="mb-3">
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                        <Text className="font-semibold text-gray-900">{item.event}</Text>
                        <Text className="text-sm text-muted mt-1">
                            {item.start_date ? formatDate(item.start_date) : 'No date set'}
                        </Text>

                    </View>
                    <View className={`rounded-full px-3 py-1 ${item.status === 'upcoming' || item.status === 'ongoing' ? 'bg-success/10' :
                        item.status === 'cancelled' ? 'bg-danger/10' : 'bg-gray-100'
                        }`}>
                        <Text className={`text-xs font-medium capitalize ${item.status === 'upcoming' || item.status === 'ongoing' ? 'text-success' :
                            item.status === 'cancelled' ? 'text-danger' : 'text-muted'
                            }`}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Events</Text>
                <TouchableOpacity onPress={() => router.push('/event/create')}>
                    <Ionicons name="add-circle" size={28} color="#7C2A2A" />
                </TouchableOpacity>
            </View>

            <FlashList
                data={events || []}
                renderItem={renderEvent}
                estimatedItemSize={100}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#7C2A2A" />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="calendar-outline" size={48} color="#CDCDCD" />
                            <Text className="text-base text-muted mt-4">No events yet</Text>
                            <Button
                                title="Create Event"
                                onPress={() => router.push('/event/create')}
                                className="mt-4"
                            />
                        </View>
                    ) : null
                }
            />
        </Screen>
    );
}
