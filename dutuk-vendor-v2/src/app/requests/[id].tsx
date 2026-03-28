import UnifiedCalendar from '@/components/UnifiedCalendar';
import { useAcceptRequest, useRejectRequest, useRequestById } from '@/features/requests/hooks';
import { useUIStore } from '@/store/uiStore';
import { formatDate } from '@/utils';
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RequestDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: request, isLoading } = useRequestById(id);
    const acceptMutation = useAcceptRequest();
    const rejectMutation = useRejectRequest();
    const showToast = useUIStore((state: any) => state.showToast);

    const markedDates = useMemo(() => {
        if (!request?.event_date) return {};
        return {
            [request.event_date]: { selected: true, selectedColor: '#800000' }
        };
    }, [request]);

    const handleAccept = async () => {
        try {
            await acceptMutation.mutateAsync(id);
            router.back();
        } catch (error) {
            console.error("Accept failed:", error);
        }
    };

    const handleReject = async () => {
        try {
            await rejectMutation.mutateAsync(id);
            router.back();
        } catch (error) {
            console.error("Reject failed:", error);
        }
    };

    if (isLoading && !request) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            </SafeAreaView>
        );
    }

    if (!request) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Request not found</Text>
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
                    <Text style={styles.headerTitle}>Inquiry Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.card}>
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusBadge,
                            (request.status === 'pending' ? styles.statusPending :
                                request.status === 'accepted' ? styles.statusAccepted :
                                    styles.statusRejected) as any
                        ]}>
                            <Text style={[
                                styles.statusText,
                                {
                                    color: request.status === 'pending' ? '#D97706' :
                                        request.status === 'accepted' ? '#059669' :
                                            '#DC2626'
                                }
                            ]}>{request.status.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.budgetMain}>₹{request.budget || "0"}</Text>
                    </View>

                    <Text style={styles.titleText}>{request.event_type}</Text>
                    <Text style={styles.customerName}>From: {request.customer_name}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Scheduled Date</Text>
                    <View style={styles.calendarCard}>
                        <UnifiedCalendar
                            initialDate={new Date(request.event_date)}
                            selectedDate={new Date(request.event_date).getDate()}
                            markedDates={markedDates as any}
                            disabled={true}
                        />
                        <View style={styles.dateInfo}>
                            <Ionicons name="calendar" size={16} color="#800000" />
                            <Text style={styles.dateLabelText}>{formatDate(request.event_date)}</Text>
                        </View>
                    </View>

                    <Text style={styles.label}>Message/Notes</Text>
                    <View style={styles.notesBox}>
                        <Text style={styles.notesText}>{request.description || "No specific requirements mentioned."}</Text>
                    </View>

                    {request.location && (
                        <>
                            <Text style={styles.label}>Location</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-sharp" size={16} color="#800000" />
                                <Text style={styles.locationText}>{request.location}</Text>
                            </View>
                        </>
                    )}
                </View>

                {request.status === 'pending' && (
                    <View style={styles.actionRow}>
                        <Pressable
                            style={[styles.actionButton, styles.acceptButton, acceptMutation.isPending && styles.buttonDisabled]}
                            onPress={handleAccept}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                        >
                            {acceptMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Accept Inquiry</Text>}
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.rejectButton, rejectMutation.isPending && styles.buttonDisabled]}
                            onPress={handleReject}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Decline</Text>}
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
    statusAccepted: { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: 'rgba(52, 199, 89, 0.2)' },
    statusRejected: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.2)' },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    budgetMain: { fontSize: 22, fontWeight: '800', color: '#800000' },
    titleText: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginBottom: 4 },
    customerName: { fontSize: 15, color: '#57534e', fontWeight: '500', marginBottom: 20 },
    divider: { height: 1, backgroundColor: 'rgba(128, 0, 0, 0.06)', marginVertical: 10, marginBottom: 20 },
    label: { fontSize: 12, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    calendarCard: { backgroundColor: '#fffcfc', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.04)' },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, alignSelf: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.05)' },
    dateLabelText: { fontSize: 14, fontWeight: '600', color: '#800000' },
    notesBox: { backgroundColor: 'rgba(128, 0, 0, 0.02)', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#800000', marginBottom: 24 },
    notesText: { fontSize: 15, color: '#57534e', lineHeight: 22 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    locationText: { fontSize: 15, color: '#57534e', fontWeight: '500' },
    actionRow: { gap: 12 },
    actionButton: { paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4 },
    acceptButton: { backgroundColor: '#800000', shadowColor: '#800000' },
    rejectButton: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FF3B30' },
    actionButtonText: { fontSize: 16, fontWeight: '700' },
    buttonDisabled: { opacity: 0.6 },
    backButton: { padding: 12, backgroundColor: '#800000', borderRadius: 12, marginTop: 16 },
    backButtonText: { color: '#FFF', fontWeight: '600' }
});

export default RequestDetailScreen;
