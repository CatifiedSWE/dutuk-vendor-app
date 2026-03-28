import { useOrders } from '@/features/orders/hooks';
import { useCompanyInfo } from '@/features/profile/hooks';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLACEHOLDER_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

const OrdersScreen = () => {
    const { orders, isLoading, refetch } = useOrders();
    const companyQuery = useCompanyInfo();
    const showToast = useUIStore((state: any) => state.showToast);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error('Failed to refresh orders:', error);
            showToast({ type: 'error', title: 'Refresh Failed', message: 'Failed to refresh data' });
        } finally {
            setRefreshing(false);
        }
    }, [refetch, showToast]);

    const renderOrderItem = useCallback(({ item }: { item: any }) => {
        const status = item.status;
        const goTo = status === 'pending' ? `/orders/${item.id}/approval` : `/orders/${item.id}`;

        return (
            <Pressable
                style={styles.orderCard}
                onPress={() => router.push({
                    pathname: goTo as any,
                    params: {
                        id: item.id,
                        title: item.title,
                        customerName: item.customerName,
                    }
                })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderIdLabel}>ORDER</Text>
                        <Text style={styles.orderId}>#{item.id.substring(0, 8).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {status === 'pending' && (
                            <View style={styles.pendingBadge}><Text style={styles.pendingText}>PENDING</Text></View>
                        )}
                        {status === 'approved' && (
                            <View style={styles.approvedBadge}><Text style={styles.approvedText}>APPROVED</Text></View>
                        )}
                        {status === 'completed' && (
                            <View style={styles.doneBadge}><Text style={styles.doneText}>COMPLETED</Text></View>
                        )}
                        {status === 'rejected' && (
                            <View style={styles.rejectedBadge}><Text style={styles.rejectedText}>CANCELLED</Text></View>
                        )}
                    </View>
                </View>

                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>

                <View style={styles.cardFooter}>
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={16} color="#57534e" />
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                    {item.amount ? (
                        <View style={styles.amountContainer}>
                            <Text style={styles.amountText}>₹{item.amount}</Text>
                        </View>
                    ) : null}
                </View>
            </Pressable>
        );
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.leftIconsGroup}>
                    <Pressable style={styles.headerIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#1c1917" />
                    </Pressable>
                    <Pressable style={styles.headerIcon} onPress={() => router.push('/profile/calendar')}>
                        <Ionicons name="calendar-outline" size={24} color="#1c1917" />
                    </Pressable>
                </View>

                <Pressable style={styles.profileIcon} onPress={() => router.push('/profile')}>
                    <Image
                        source={{ uri: companyQuery.data?.logo_url || PLACEHOLDER_AVATAR }}
                        style={styles.profileImage}
                    />
                </Pressable>
            </View>

            <View style={{ flex: 1 }}>
                <FlashList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#800000"
                            colors={["#800000"]}
                        />
                    }
                    ListHeaderComponent={(
                        <View style={styles.titleContainer}>
                            <View style={styles.titleRow}>
                                <Text style={styles.headerTitle}>Orders</Text>
                            </View>
                            <Text style={styles.headerSubtitle}>
                                Manage your bookings and requests
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={(
                        isLoading ? (
                            <View style={styles.emptyStateContainer}>
                                <ActivityIndicator size="large" color="#800000" />
                                <Text style={styles.loadingText}>Loading orders...</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyStatePlaceholder}>
                                    <Ionicons name="document-text-outline" size={64} color="#e7e5e4" />
                                    <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
                                    <Text style={styles.emptyStateSubtitle}>
                                        Your orders will appear here once customers start booking your services
                                    </Text>
                                </View>
                            </View>
                        )
                    )}
                    renderItem={renderOrderItem}
                    estimatedItemSize={250}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf8f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28, paddingTop: 16, paddingBottom: 16, zIndex: 10 },
    scrollContent: { paddingBottom: 28 },
    leftIconsGroup: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    headerIcon: {
        width: 52, height: 52, backgroundColor: 'rgba(255, 252, 250, 0.95)', borderRadius: 26,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.08)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
    },
    profileIcon: {
        width: 52, height: 52, borderRadius: 26, overflow: 'hidden', backgroundColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(128, 0, 0, 0.12)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
    },
    profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    titleContainer: { paddingHorizontal: 28, paddingBottom: 28, paddingTop: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    headerTitle: { fontSize: 32, fontWeight: '700', color: '#800000', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 15, fontWeight: '500', color: '#57534e', marginTop: 4 },
    emptyStateContainer: { minHeight: 400, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
    emptyStatePlaceholder: {
        alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, padding: 48,
        width: '100%', maxWidth: 320, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#1c1917', marginTop: 24, marginBottom: 12, textAlign: 'center', letterSpacing: -0.3 },
    emptyStateSubtitle: { fontSize: 14, fontWeight: '400', color: '#57534e', textAlign: 'center', lineHeight: 22 },
    orderCard: {
        width: '100%', maxWidth: 370, alignSelf: 'center', backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    orderIdContainer: { flexDirection: 'column' },
    orderIdLabel: { fontSize: 10, fontWeight: '700', color: '#a8a29e', letterSpacing: 1.5, marginBottom: 4 },
    orderId: { fontSize: 15, fontWeight: '700', color: '#1c1917', letterSpacing: 0.5 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    pendingBadge: { backgroundColor: 'rgba(128, 0, 0, 0.08)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.12)' },
    pendingText: { fontSize: 11, fontWeight: '700', color: '#800000', letterSpacing: 0.8 },
    approvedBadge: { backgroundColor: '#34C75915', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    approvedText: { fontSize: 11, fontWeight: '700', color: '#34C759', letterSpacing: 0.8 },
    doneBadge: { backgroundColor: '#1c1917', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    doneText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.8 },
    rejectedBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    rejectedText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.8 },
    loadingText: { marginTop: 16, fontSize: 15, color: '#57534e', fontWeight: '500' },
    amountContainer: { backgroundColor: 'rgba(128, 0, 0, 0.05)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
    amountText: { fontSize: 15, fontWeight: '700', color: '#800000', letterSpacing: -0.2 },
    eventTitle: { fontSize: 18, fontWeight: '700', color: '#1c1917', marginBottom: 10, letterSpacing: -0.3 },
    customerName: { fontSize: 14, fontWeight: '500', color: '#57534e', marginBottom: 18 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(128, 0, 0, 0.06)' },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateText: { fontSize: 14, fontWeight: '600', color: '#57534e' },
});

export default OrdersScreen;
