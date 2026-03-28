import UnifiedCalendar from '@/components/UnifiedCalendar';
import { useOrderById, useUpdateOrderStatus } from '@/features/orders/hooks';
import { useUIStore } from '@/store/uiStore';
import { formatDate } from '@/utils';
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: order, isLoading } = useOrderById(id);
    const updateStatusMutation = useUpdateOrderStatus();
    const showToast = useUIStore((state: any) => state.showToast);

    const markedDates = useMemo(() => {
        if (!order?.rawEventDate) return {};
        // rawEventDate could be a full ISO string (from row.created_at) or YYYY-MM-DD
        const datePart = order.rawEventDate.split('T')[0];
        return {
            [datePart]: { selected: true, selectedColor: '#800000' }
        };
    }, [order]);

    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return;
        await Clipboard.setStringAsync(text);
        showToast({ type: 'success', title: 'Copied', message: `${label} copied to clipboard` });
    };

    const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        try {
            await updateStatusMutation.mutateAsync({ orderId: id, status });
            if (status === 'approved') {
                router.replace('/(tabs)/chat');
            } else {
                router.back();
            }
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    if (isLoading && !order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Order not found</Text>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#800000" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.card}>
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusBadge,
                            (order.status === 'pending' ? styles.statusPending :
                                order.status === 'approved' ? styles.statusApproved :
                                    order.status === 'completed' ? styles.statusCompleted :
                                        styles.statusRejected) as any
                        ]}>
                            <Text style={[
                                styles.statusText,
                                {
                                    color: order.status === 'pending' ? '#D97706' :
                                        order.status === 'approved' ? '#059669' :
                                            order.status === 'completed' ? '#800000' :
                                                '#DC2626'
                                }
                            ]}>{order.status.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.amountText}>₹{order.amount || "0"}</Text>
                    </View>

                    <Text style={styles.titleText}>{order.title}</Text>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.packageLabel}>Package: <Text style={{ color: '#1c1917' }}>{order.packageType}</Text></Text>

                    <View style={styles.contactSection}>
                        <Pressable style={styles.contactItem} onPress={() => copyToClipboard(order.customerEmail, 'Email')}>
                            <Text style={styles.contactValue} numberOfLines={1}>{order.customerEmail}</Text>
                            <Ionicons name="copy-outline" size={16} color="#FFF" />
                        </Pressable>
                        <Pressable style={styles.contactItem} onPress={() => copyToClipboard(order.customerPhone, 'Phone')}>
                            <Text style={styles.contactValue}>{order.customerPhone}</Text>
                            <Ionicons name="copy-outline" size={16} color="#FFF" />
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Event Date</Text>
                    <View style={styles.calendarCard}>
                        <UnifiedCalendar
                            initialDate={new Date(order.rawEventDate)}
                            selectedDate={new Date(order.rawEventDate).getDate()}
                            markedDates={markedDates as any}
                            disabled={true}
                        />
                        <View style={styles.dateInfo}>
                            <Ionicons name="calendar" size={16} color="#800000" />
                            <Text style={styles.dateLabelText}>{formatDate(order.rawEventDate)}</Text>
                        </View>
                    </View>

                    {order.notes && (
                        <>
                            <Text style={styles.label}>Customer Notes</Text>
                            <View style={styles.notesBox}>
                                <Text style={styles.notesText}>{order.notes}</Text>
                            </View>
                        </>
                    )}
                </View>

                {order.status === 'pending' && (
                    <View style={styles.actionRow}>
                        <Pressable
                            style={[styles.actionButton, styles.acceptButton, updateStatusMutation.isPending && styles.buttonDisabled]}
                            onPress={() => handleStatusUpdate('approved')}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Approve Order</Text>}
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.rejectButton, updateStatusMutation.isPending && styles.buttonDisabled]}
                            onPress={() => handleStatusUpdate('rejected')}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Reject</Text>}
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8f5" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#800000' },
    iconButton: { padding: 8, backgroundColor: "#FFF", borderRadius: 12, shadowColor: "#800000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: "rgba(128, 0, 0, 0.04)", shadowColor: "#800000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    statusPending: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
    statusApproved: { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: 'rgba(52, 199, 89, 0.2)' },
    statusRejected: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.2)' },
    statusCompleted: { backgroundColor: 'rgba(128, 0, 0, 0.05)', borderColor: 'rgba(128, 0, 0, 0.1)' },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    amountText: { fontSize: 22, fontWeight: '800', color: '#800000' },
    titleText: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginBottom: 4 },
    customerName: { fontSize: 17, color: '#444', fontWeight: '600', marginBottom: 4 },
    packageLabel: { fontSize: 14, color: '#777', fontWeight: '500', marginBottom: 20 },
    contactSection: { gap: 10, marginBottom: 20 },
    contactItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#800000', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, shadowColor: '#800000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    contactValue: { color: '#FFF', fontWeight: '600', fontSize: 14, flex: 1, marginRight: 8 },
    divider: { height: 1, backgroundColor: 'rgba(128, 0, 0, 0.06)', marginVertical: 10, marginBottom: 20 },
    label: { fontSize: 12, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    calendarCard: { backgroundColor: '#fffcfc', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.04)' },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, alignSelf: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.05)' },
    dateLabelText: { fontSize: 14, fontWeight: '600', color: '#800000' },
    notesBox: { backgroundColor: '#FFF8E7', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginBottom: 24 },
    notesText: { fontSize: 15, color: '#78350F', lineHeight: 22 },
    actionRow: { gap: 12 },
    actionButton: { paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4 },
    acceptButton: { backgroundColor: '#34c759', shadowColor: '#34c759' },
    rejectButton: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FF3B30' },
    actionButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    buttonDisabled: { opacity: 0.6 },
    backButton: { padding: 12, backgroundColor: '#800000', borderRadius: 12, marginTop: 16 },
    backButtonText: { color: '#FFF', fontWeight: '600' }
});

export default OrderDetailScreen;
