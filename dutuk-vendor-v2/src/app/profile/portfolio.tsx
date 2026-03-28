import { useDeletePortfolioItem, usePortfolio } from '@/features/profile/hooks';
import type { PortfolioItem } from '@/features/profile/types';
import { Screen } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';

export default function PortfolioScreen() {
    const { data: items, isLoading, refetch, isRefetching } = usePortfolio();
    const deleteItem = useDeletePortfolioItem();

    const renderItem = ({ item }: { item: PortfolioItem }) => (
        <View className="relative m-1 rounded-lg overflow-hidden" style={{ width: '48%', aspectRatio: 1 }}>
            <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
            <TouchableOpacity
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                onPress={() => deleteItem.mutate(item.id)}
            >
                <Ionicons name="trash-outline" size={16} color="#fff" />
            </TouchableOpacity>
            {item.title && (
                <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                    <Text className="text-white text-xs" numberOfLines={1}>{item.title}</Text>
                </View>
            )}
        </View>
    );

    return (
        <Screen padded safeArea>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Portfolio</Text>
                <View className="w-6" />
            </View>

            <FlashList
                data={items || []}
                renderItem={renderItem}
                numColumns={2}
                estimatedItemSize={200}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C2A2A" />}
                ListEmptyComponent={!isLoading ? (
                    <View className="items-center py-20">
                        <Ionicons name="images-outline" size={48} color="#CDCDCD" />
                        <Text className="text-base text-muted mt-4">No portfolio items yet</Text>
                    </View>
                ) : null}
            />
        </Screen>
    );
}
