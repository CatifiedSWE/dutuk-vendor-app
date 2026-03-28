import { useReviews } from '@/features/profile/hooks';
import type { VendorReview } from '@/features/profile/types';
import { Avatar, Card, Screen } from '@/shared/ui';
import { formatRelativeTime } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';

function StarRating({ rating }: { rating: number }) {
    return (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                    key={star}
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={14}
                    color="#FFB800"
                />
            ))}
        </View>
    );
}

export default function ReviewsScreen() {
    const { data: reviews, isLoading, refetch, isRefetching } = useReviews();

    const renderReview = ({ item }: { item: VendorReview }) => (
        <Card variant="outlined" className="mb-3">
            <View className="flex-row items-center">
                <Avatar source={item.customer_avatar} name={item.customer_name} size="sm" />
                <View className="ml-3 flex-1">
                    <Text className="font-semibold text-gray-900">{item.customer_name}</Text>
                    <View className="flex-row items-center mt-0.5">
                        <StarRating rating={item.rating} />
                        <Text className="ml-2 text-xs text-muted">{formatRelativeTime(item.created_at)}</Text>
                    </View>
                </View>
            </View>
            {item.comment && (
                <Text className="text-sm text-gray-700 mt-3 leading-5">{item.comment}</Text>
            )}
        </Card>
    );

    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Reviews</Text>
                <View className="w-6" />
            </View>

            <FlashList
                data={reviews || []}
                renderItem={renderReview}
                estimatedItemSize={100}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C2A2A" />}
                ListEmptyComponent={!isLoading ? (
                    <View className="items-center py-20">
                        <Ionicons name="star-outline" size={48} color="#CDCDCD" />
                        <Text className="text-base text-muted mt-4">No reviews yet</Text>
                    </View>
                ) : null}
            />
        </Screen>
    );
}
