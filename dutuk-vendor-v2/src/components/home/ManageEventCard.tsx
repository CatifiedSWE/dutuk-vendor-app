import type { Event } from '@/features/events/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const EVENT_PLACEHOLDER = require('@/assets/images/icon.png');

interface ManageEventCardProps {
    item: Event;
}

const ManageEventCard: React.FC<ManageEventCardProps> = ({ item }) => {
    const [isLoading, setIsLoading] = useState(false);
    const imageUri = item.image_url || "";

    return (
        <Pressable
            style={styles.manageCard}
            onPress={() => router.push(`/event/manage/${item.id}`)}
        >
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.manageCardImage}
                            onLoadStart={() => setIsLoading(true)}
                            onLoadEnd={() => setIsLoading(false)}
                        />
                        {isLoading && (
                            <View style={styles.imageLoadingOverlay}>
                                <ActivityIndicator color="#800000" size="large" />
                            </View>
                        )}
                    </>
                ) : (
                    <Image
                        source={EVENT_PLACEHOLDER}
                        style={styles.manageCardImage}
                    />
                )}
            </View>
            <View style={styles.manageCardContent}>
                <Text style={styles.manageCardTitle}>{item.event}</Text>
                {item.description ? (
                    <Text style={styles.manageCardDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : (
                    <Text style={styles.manageCardDescriptionMuted}>No description yet</Text>
                )}
                <View style={styles.manageCardFooter}>
                    <View style={[styles.manageStatusBadge,
                    item.status === 'upcoming' && styles.statusUpcoming,
                    item.status === 'ongoing' && styles.statusOngoing
                    ]}>
                        <Text style={[styles.manageStatusText,
                        item.status === 'upcoming' && styles.statusUpcomingText,
                        item.status === 'ongoing' && styles.statusOngoingText
                        ]}>{item.status}</Text>
                    </View>
                    <Text style={styles.managePaymentText}>₹{item.payment?.toFixed(2) ?? "0.00"}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    manageCard: {
        width: 300, backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, marginRight: 18,
        marginVertical: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    imageContainer: { position: 'relative', width: '100%', height: 160, backgroundColor: '#faf8f5' },
    imageLoadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 252, 250, 0.9)',
        justifyContent: 'center', alignItems: 'center',
    },
    manageCardImage: { width: '100%', height: 160, resizeMode: 'cover' },
    manageCardContent: { padding: 24, gap: 12 },
    manageCardTitle: { fontSize: 18, fontWeight: '700', color: '#1c1917', letterSpacing: -0.3, lineHeight: 24 },
    manageCardDescription: { fontSize: 14, color: '#57534e', lineHeight: 22, fontWeight: '400' },
    manageCardDescriptionMuted: { fontSize: 14, color: '#a8a29e', fontStyle: 'italic', fontWeight: '400' },
    manageCardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16,
        paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(128, 0, 0, 0.06)',
    },
    manageStatusBadge: { backgroundColor: '#f5f5f4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    manageStatusText: { fontSize: 10, textTransform: 'uppercase', color: '#57534e', fontWeight: '700', letterSpacing: 1.5 },
    statusUpcoming: { backgroundColor: '#007AFF10' },
    statusUpcomingText: { color: '#007AFF' },
    statusOngoing: { backgroundColor: '#FF950010' },
    statusOngoingText: { color: '#FF9500' },
    managePaymentText: { fontSize: 18, fontWeight: '700', color: '#800000', letterSpacing: -0.3 },
});

export default React.memo(ManageEventCard);
