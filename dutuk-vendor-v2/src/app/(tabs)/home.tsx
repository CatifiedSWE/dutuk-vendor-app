import UnifiedCalendar from '@/components/UnifiedCalendar';
import ActivityCard from '@/components/home/ActivityCard';
import ManageEventCard from '@/components/home/ManageEventCard';
import ReviewCard from '@/components/home/ReviewCard';
import { useAllEvents, useCalendarDates } from '@/features/events/hooks';
import { useCompanyInfo, useVendorReviews } from '@/features/profile/hooks';
import { usePendingInquiriesCount, useRequestsCount } from '@/features/requests/hooks';
import { useVendorStore } from '@/store/vendorStore';
import { buildAvailabilityMarkedDates, MarkedDatesMap, mergeAvailabilityWithEvents } from '@/utils/calendarAvailability';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLACEHOLDER_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

export default function HomeScreen() {
    const companyQuery = useCompanyInfo();
    const allEventsQuery = useAllEvents();
    const calendarDatesQuery = useCalendarDates();
    const requestsCountQuery = useRequestsCount();
    const inquiriesCountQuery = usePendingInquiriesCount();
    const { reviews: recentReviews, stats: reviewStats, refetch: refetchReviews } = useVendorReviews(3);

    const [profileImageLoading, setProfileImageLoading] = useState(false);

    const events = allEventsQuery.data || [];
    const calendarDates = calendarDatesQuery.data || [];
    const requestsCount = requestsCountQuery.data || 0;
    const pendingInquiries = inquiriesCountQuery.data || 0;

    const isRefreshing = useVendorStore((state) => state.isLoading);

    const onRefresh = useCallback(async () => {
        await companyQuery.refetch();
    }, [companyQuery]);

    // Optimized counts and filters
    const { manageableEvents, upcomingCount, completedCount } = useMemo(() => {
        const now = new Date();
        return {
            manageableEvents: events.filter((evt) => evt.status !== 'completed'),
            upcomingCount: events.filter(e => new Date(e.start_date || e.created_at) > now).length,
            completedCount: events.filter(e => e.status === 'completed').length,
        };
    }, [events]);

    // Calendar sync
    const markedDates = useMemo(() => {
        const availabilityMarked = buildAvailabilityMarkedDates(calendarDates);
        const eventMarked: MarkedDatesMap = {};

        events.forEach((event) => {
            const date = (event.start_date || event.created_at || '').split('T')[0];
            if (date) {
                eventMarked[date] = {
                    hasEvent: true,
                    eventColor: event.status === 'upcoming' ? '#007AFF' : event.status === 'cancelled' ? '#34C759' : '#FF9500',
                };
            }
        });

        return mergeAvailabilityWithEvents(availabilityMarked, eventMarked);
    }, [calendarDates, events]);

    const renderManageEventItem = useCallback(({ item }: { item: any }) => {
        if (item.type === 'add') {
            return (
                <Pressable
                    style={[styles.manageCard, styles.manageAddMoreCard]}
                    onPress={() => router.push("/event/manage/create")}
                >
                    <View style={styles.manageAddIconWrapper}>
                        <Ionicons name="add-circle-outline" size={48} color="#800000" />
                    </View>
                    <Text style={styles.manageAddMoreText}>Add Event</Text>
                </Pressable>
            );
        }
        return <ManageEventCard item={item} />;
    }, []);

    const manageListData = useMemo(() => {
        return [...manageableEvents, { id: 'add-more', type: 'add' }];
    }, [manageableEvents]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#800000"
                        colors={["#800000"]}
                        progressBackgroundColor="#faf8f5"
                    />
                }
            >
                <View style={styles.header}>
                    <View style={styles.headerIcons}>
                        <View style={styles.leftIcons}>
                            <Pressable style={styles.iconButton}>
                                <Ionicons name="notifications-outline" size={26} color="#1c1917" />
                            </Pressable>
                            <Pressable style={styles.iconButton} onPress={() => router.push("/profile/calendar")}>
                                <Ionicons name="calendar-outline" size={26} color="#1c1917" />
                            </Pressable>
                        </View>

                        <Pressable style={styles.profileIcon} onPress={() => router.push("/profile/edit")}>
                            <Image
                                source={{ uri: companyQuery.data?.logo_url || PLACEHOLDER_AVATAR }}
                                style={styles.profileImage}
                                onLoadStart={() => setProfileImageLoading(true)}
                                onLoadEnd={() => setProfileImageLoading(false)}
                            />
                            {profileImageLoading && (
                                <View style={styles.profileImageLoadingOverlay}>
                                    <ActivityIndicator color="#800000" size="small" />
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Home</Text>
                </View>

                {/* Calendar Section */}
                <View style={styles.calendarSection}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.calendarTitle}>Your Calendar</Text>
                        <Pressable onPress={() => router.push("/profile/calendar")}>
                            <Text style={styles.calendarLink}>Manage</Text>
                        </Pressable>
                    </View>
                    <Pressable
                        style={styles.calendarWrapper}
                        onPress={() => router.push("/profile/calendar")}
                    >
                        <UnifiedCalendar
                            markedDates={markedDates}
                            disabled={true}
                        />
                    </Pressable>
                </View>

                {/* Manage Events Section */}
                <View style={styles.manageSection}>
                    <View style={styles.manageHeader}>
                        <Text style={styles.sectionTitle}>Manage Events</Text>
                        <Pressable
                            style={styles.createButton}
                            onPress={() => router.push("/event/manage/create")}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create</Text>
                        </Pressable>
                    </View>

                    {manageableEvents.length === 0 ? (
                        <Pressable
                            style={styles.emptyManageCard}
                            onPress={() => router.push("/event/manage/create")}
                        >
                            <Ionicons name="calendar-outline" size={40} color="#800000" />
                            <Text style={styles.emptyManageTitle}>Create your first event</Text>
                            <Text style={styles.emptyManageSubtitle}>
                                Start building your event portfolio and showcase it to customers.
                            </Text>
                        </Pressable>
                    ) : (
                        <View style={{ height: 350 }}>
                            <FlashList
                                data={manageListData}
                                renderItem={renderManageEventItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.manageScrollContent}
                                estimatedItemSize={300}
                                keyExtractor={(item) => item.id}
                            />
                        </View>
                    )}
                </View>

                {/* Events Section */}
                <View style={styles.eventsSection}>
                    <View style={styles.eventsSectionHeader}>
                        <Text style={styles.sectionTitle}>Events</Text>
                        <Pressable
                            style={styles.viewAllButton}
                            onPress={() => router.push("/event")}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#800000" />
                        </Pressable>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.eventsScrollContent}
                    >
                        <Pressable style={styles.eventCard} onPress={() => router.push("/event/upcoming" as any)}>
                            <View style={[styles.eventIconContainer, { backgroundColor: '#80000015' }]}>
                                <Ionicons name="calendar-outline" size={28} color="#800000" />
                            </View>
                            <Text style={styles.eventCardTitle}>Upcoming</Text>
                            <Text style={styles.eventCardCount}>{upcomingCount}</Text>
                            <Text style={styles.eventCardDescription}>Events scheduled ahead</Text>
                        </Pressable>

                        <Pressable style={styles.eventCard} onPress={() => router.push("/event/past" as any)}>
                            <View style={[styles.eventIconContainer, { backgroundColor: '#34C75915' }]}>
                                <Ionicons name="checkmark-circle-outline" size={28} color="#34C759" />
                            </View>
                            <Text style={styles.eventCardTitle}>Completed</Text>
                            <Text style={styles.eventCardCount}>{completedCount}</Text>
                            <Text style={styles.eventCardDescription}>Successfully delivered</Text>
                        </Pressable>

                        <Pressable style={styles.eventCard} onPress={() => router.push("/event")}>
                            <View style={[styles.eventIconContainer, { backgroundColor: '#a8a29e15' }]}>
                                <Ionicons name="grid-outline" size={28} color="#57534e" />
                            </View>
                            <Text style={styles.eventCardTitle}>All Events</Text>
                            <Text style={styles.eventCardCount}>{events.length}</Text>
                            <Text style={styles.eventCardDescription}>Complete history</Text>
                        </Pressable>
                    </ScrollView>
                </View>

                {/* Activity Section */}
                <View style={styles.requestsSection}>
                    <Text style={styles.sectionTitle}>Activity</Text>
                    <ActivityCard
                        title="Pending Requests"
                        count={requestsCount}
                        icon="document-text-outline"
                        onPress={() => router.push("/requests/menu")}
                    />

                    <ActivityCard
                        title="Event Inquiries"
                        count={pendingInquiries}
                        icon="mail-outline"
                        onPress={() => router.push("/requests/inquiries")}
                        pendingCount={pendingInquiries}
                    />
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Quick Stats</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {events.filter(e => {
                                    const d = new Date(e.start_date || e.created_at);
                                    const now = new Date();
                                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                }).length}
                            </Text>
                            <Text style={styles.statLabel}>This Month</Text>
                        </View>
                    </View>
                </View>

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        <Pressable style={styles.viewAllButton} onPress={() => router.push("/profile/reviews")}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#800000" />
                        </Pressable>
                    </View>

                    {recentReviews.length === 0 ? (
                        <View style={styles.emptyReviewsCard}>
                            <Ionicons name="star-outline" size={44} color="#FFC13C" />
                            <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
                            <Text style={styles.emptyReviewsSubtitle}>Customer reviews will appear here after completed events</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.reviewsStatsCard}>
                                <View style={styles.reviewsRating}>
                                    <Text style={styles.reviewsRatingNumber}>{reviewStats.averageRating || '—'}</Text>
                                    <View style={styles.reviewsStarsContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={reviewStats.averageRating >= star ? "star" : reviewStats.averageRating >= star - 0.5 ? "star-half" : "star-outline"}
                                                size={20}
                                                color="#FFC13C"
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewsCountText}>{reviewStats.totalReviews} reviews</Text>
                                </View>
                            </View>

                            <View style={{ height: 200 }}>
                                <FlashList
                                    data={recentReviews}
                                    renderItem={({ item }) => <ReviewCard review={item} />}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.reviewsScrollContent}
                                    estimatedItemSize={310}
                                />
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf8f5' },
    header: { paddingTop: 16, paddingHorizontal: 28, paddingBottom: 24, backgroundColor: 'transparent' },
    headerIcons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leftIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    iconButton: {
        width: 52, height: 52, backgroundColor: 'rgba(255, 252, 250, 0.95)', borderRadius: 26,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.08)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
    },
    profileIcon: {
        width: 52, height: 52, borderRadius: 26, overflow: 'hidden', backgroundColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center', position: 'relative', borderWidth: 2,
        borderColor: 'rgba(128, 0, 0, 0.12)', shadowColor: '#800000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
    },
    profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    profileImageLoadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)', alignItems: 'center', justifyContent: 'center',
    },
    titleContainer: { marginBottom: 28, paddingHorizontal: 28 },
    title: { fontSize: 32, fontWeight: '700', color: '#800000', letterSpacing: -0.5 },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 50 },
    calendarSection: {
        backgroundColor: '#FFFFFF', borderRadius: 28, marginHorizontal: 28, marginBottom: 56,
        overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 32, elevation: 12,
    },
    calendarHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 28, paddingTop: 28, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(128, 0, 0, 0.04)',
    },
    calendarTitle: { fontSize: 20, fontWeight: '700', color: '#1c1917', letterSpacing: -0.3 },
    calendarLink: { fontSize: 15, fontWeight: '700', color: '#800000', letterSpacing: 0.8, textTransform: 'uppercase' },
    calendarWrapper: { paddingHorizontal: 28, paddingBottom: 24, paddingTop: 8 },
    eventsSection: { marginBottom: 56 },
    manageSection: { marginBottom: 56 },
    manageHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, paddingLeft: 28, paddingRight: 28, minHeight: 48,
    },
    createButton: {
        flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#800000',
        borderRadius: 32, paddingHorizontal: 24, paddingVertical: 14, shadowColor: '#800000',
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
    },
    createButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.5, textTransform: 'uppercase' },
    emptyManageCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, padding: 48, alignItems: 'center',
        justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.08)', shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, marginHorizontal: 28,
    },
    emptyManageTitle: { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#1c1917', letterSpacing: -0.3 },
    emptyManageSubtitle: { marginTop: 12, fontSize: 14, color: '#57534e', textAlign: 'center', lineHeight: 22, fontWeight: '400' },
    manageScrollContent: { paddingLeft: 28, paddingRight: 28, paddingVertical: 10 },
    manageCard: {
        width: 300, backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, marginRight: 18,
        marginVertical: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    manageAddMoreCard: { alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: 'rgba(128, 0, 0, 0.02)', height: 320, width: 200 },
    manageAddIconWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    manageAddMoreText: { fontSize: 15, fontWeight: '700', color: '#800000', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },
    eventsSectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
        paddingLeft: 28, paddingRight: 28, minHeight: 48,
    },
    viewAllButton: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: 'rgba(128, 0, 0, 0.06)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.08)',
    },
    viewAllText: { fontSize: 13, fontWeight: '700', color: '#800000', marginRight: 4, letterSpacing: 0.8, textTransform: 'uppercase' },
    eventsScrollContent: { paddingLeft: 28, paddingRight: 28, paddingVertical: 10 },
    eventCard: {
        width: 180, backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, padding: 26, marginRight: 16,
        marginVertical: 10, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)', shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    eventIconContainer: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    eventCardTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917', marginBottom: 10, letterSpacing: -0.2 },
    eventCardCount: { fontSize: 28, fontWeight: '700', color: '#800000', marginBottom: 12, letterSpacing: -1.2 },
    eventCardDescription: { fontSize: 13, color: '#57534e', lineHeight: 19, fontWeight: '400' },
    requestsSection: { marginBottom: 56, paddingHorizontal: 28 },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1c1917', marginBottom: 20, letterSpacing: -0.4 },
    statsSection: { marginBottom: 56, paddingHorizontal: 28 },
    statsGrid: { flexDirection: 'row', gap: 18 },
    statCard: {
        flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, padding: 32,
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)', shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
    },
    statNumber: { fontSize: 36, fontWeight: '700', color: '#800000', marginBottom: 10, letterSpacing: -1.5 },
    statLabel: { fontSize: 13, color: '#57534e', textAlign: 'center', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    reviewsSection: { marginBottom: 56, overflow: 'visible' },
    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 28 },
    emptyReviewsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, padding: 48, alignItems: 'center',
        marginHorizontal: 28, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)', shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
    },
    emptyReviewsTitle: { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#1c1917', letterSpacing: -0.3 },
    emptyReviewsSubtitle: { marginTop: 12, fontSize: 14, color: '#57534e', textAlign: 'center', lineHeight: 22, fontWeight: '400' },
    reviewsStatsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 24, padding: 36, marginHorizontal: 28,
        marginBottom: 24, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.06)', shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    reviewsRating: { alignItems: 'center' },
    reviewsRatingNumber: { fontSize: 48, fontWeight: '700', color: '#1c1917', letterSpacing: -2 },
    reviewsStarsContainer: { flexDirection: 'row', marginTop: 12, marginBottom: 12 },
    reviewsCountText: { fontSize: 13, color: '#57534e', fontWeight: '600', letterSpacing: 0.3 },
    reviewsScrollContent: { paddingLeft: 28, paddingRight: 28 },
});
