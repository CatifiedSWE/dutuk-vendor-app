import type { VendorReview } from '@/features/profile/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ReviewCardProps {
    review: VendorReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <View style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
                <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitial}>{review.customer_name?.charAt(0)?.toUpperCase() || 'C'}</Text>
                    </View>
                    <View>
                        <Text style={styles.reviewerName}>{review.customer_name}</Text>
                        <Text style={styles.reviewEventName}>Event Verified</Text>
                    </View>
                </View>
                <View style={styles.reviewRatingBadge}>
                    <Ionicons name="star" size={14} color="#FFC13C" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                </View>
            </View>
            {review.comment && (
                <Text style={styles.reviewText} numberOfLines={3}>"{review.comment}"</Text>
            )}
            <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                <Text style={styles.verifiedText}>Verified Booking</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    reviewCard: {
        width: 310, backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, padding: 24,
        marginRight: 18, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)', shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    reviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    reviewerAvatar: {
        width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFC13C', alignItems: 'center',
        justifyContent: 'center', marginRight: 14, borderWidth: 2, borderColor: 'rgba(255, 193, 60, 0.2)',
    },
    reviewerInitial: { fontSize: 19, fontWeight: '700', color: '#FFFFFF' },
    reviewerName: { fontSize: 15, fontWeight: '700', color: '#1c1917', letterSpacing: -0.1 },
    reviewEventName: { fontSize: 12, color: '#57534e', marginTop: 3, fontWeight: '500' },
    reviewRatingBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E6', paddingHorizontal: 12,
        paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 193, 60, 0.2)',
    },
    reviewRatingText: { fontSize: 14, fontWeight: '700', color: '#1c1917', marginLeft: 5 },
    reviewText: { fontSize: 14, color: '#292524', lineHeight: 22, fontStyle: 'italic', fontWeight: '400' },
    verifiedBadge: {
        flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(128, 0, 0, 0.06)',
    },
    verifiedText: { fontSize: 12, color: '#34C759', fontWeight: '600', marginLeft: 5 },
});

export default React.memo(ReviewCard);
