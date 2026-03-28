import logger from '@/utils/logger';
import { zustandMMKVStorage } from '@/utils/storage';
import { supabase } from '@/utils/supabase';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

// =====================================================
// TYPES
// =====================================================

export interface Order {
    id: string;
    title: string;
    customerName: string;
    packageType: string;
    customerEmail: string;
    customerPhone: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    date: string;
    rawEventDate: string;
    amount?: number;
    notes?: string;
    isNew?: boolean;
}

export interface StoredDate {
    date: string;
    status: 'available' | 'unavailable';
    event?: string;
    description?: string;
}

interface VendorState {
    // Company
    company: any | null;
    companyLoading: boolean;

    // Events (single fetch, derived views)
    allEvents: any[];
    eventsLoading: boolean;

    // Orders
    orders: Order[];
    ordersLoading: boolean;
    newOrderCount: number;

    // Calendar dates
    calendarDates: StoredDate[];

    // Requests count
    requestsCount: number;
    pendingInquiries: number;

    // Reviews
    reviews: any[];
    reviewStats: {
        totalReviews: number;
        averageRating: number;
        ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number; }
    };

    // Global
    lastFetchedAt: number | null;
    isHydrated: boolean;

    reviewsLoading: boolean;
    earnings: any[];
    earningsLoading: boolean;
    payments: any[];
    paymentsLoading: boolean;

    // Actions
    fetchAll: () => Promise<void>;
    fetchCompany: () => Promise<void>;
    fetchEvents: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    fetchCalendarDates: () => Promise<void>;
    fetchRequestsCount: () => Promise<void>;
    fetchReviews: (limit?: number) => Promise<void>;
    fetchEarnings: () => Promise<void>;
    fetchPayments: () => Promise<void>;
    setOrders: (orders: Order[]) => void;
    incrementNewOrderCount: () => void;
    resetNewOrderCount: () => void;
    updateOrderInStore: (orderId: string, updates: Partial<Order>) => void;
}

// =====================================================
// HELPERS
// =====================================================

const transformOrder = (order: any, isNew: boolean = false): Order => ({
    id: order.id,
    title: order.title,
    customerName: order.customer_name,
    packageType: order.package_type || 'Standard Package',
    customerEmail: order.customer_email || '',
    customerPhone: order.customer_phone || '',
    status: order.status,
    date: order.event_date ? new Date(order.event_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Date TBD',
    rawEventDate: order.event_date || '',
    amount: order.amount,
    notes: order.notes,
    isNew,
});

// =====================================================
// STORE
/* Population is typically handled via fetchAll() during app initialization.
 */
export const useVendorStore = create<VendorState>()(
    persist(
        (set, get) => ({
            company: null,
            companyLoading: false,
            allEvents: [],
            eventsLoading: false,
            orders: [],
            ordersLoading: false,
            newOrderCount: 0,
            calendarDates: [],
            requestsCount: 0,
            pendingInquiries: 0,
            reviews: [],
            reviewStats: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            lastFetchedAt: null,
            isHydrated: false,
            reviewsLoading: false,
            earnings: [],
            earningsLoading: false,
            payments: [],
            paymentsLoading: false,

            fetchEarnings: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                set({ earningsLoading: true });
                const { data, error } = await supabase
                    .from('earnings')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('earning_date', { ascending: false });

                if (error) {
                    logger.error('Error fetching earnings:', error);
                    set({ earningsLoading: false });
                } else {
                    set({ earnings: data || [], earningsLoading: false });
                }
            },

            fetchPayments: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                set({ paymentsLoading: true });
                const { data, error } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('vendor_id', userId)
                    .eq('payment_status', 'completed')
                    .order('payment_date', { ascending: false });

                if (error) {
                    logger.error('Error fetching payments:', error);
                    set({ paymentsLoading: false });
                } else {
                    set({ payments: data || [], paymentsLoading: false });
                }
            },

            fetchAll: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                logger.log('Fetching all vendor data...');

                // Parallel fetch all data in ONE batch
                await Promise.allSettled([
                    get().fetchCompany(),
                    get().fetchEvents(),
                    get().fetchOrders(),
                    get().fetchCalendarDates(),
                    get().fetchRequestsCount(),
                    get().fetchReviews(10), // Fetch last 10 reviews
                    get().fetchEarnings(),
                    get().fetchPayments(),
                ]);

                set({ lastFetchedAt: Date.now(), isHydrated: true });
                logger.log('Vendor data hydration complete');
            },

            fetchCompany: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;
                set({ companyLoading: true });

                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    logger.error('Error fetching company info:', error);
                }

                set({ company: data || null, companyLoading: false });
            },

            fetchEvents: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;
                set({ eventsLoading: true });

                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('start_date', { ascending: true });

                if (error) {
                    logger.error('Error fetching events:', error);
                }

                set({ allEvents: data || [], eventsLoading: false });
            },

            fetchOrders: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;
                set({ ordersLoading: true });

                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    logger.error('Error fetching orders:', error);
                }

                const transformedOrders = (data || []).map(o => transformOrder(o, false));
                set({ orders: transformedOrders, ordersLoading: false });
            },

            fetchCalendarDates: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                const { data, error } = await supabase
                    .from('dates')
                    .select('date, status, event, description')
                    .eq('user_id', userId)
                    .order('date', { ascending: true });

                if (error && error.code !== 'PGRST116') {
                    logger.error('Error fetching calendar dates:', error);
                }

                const formattedDates: StoredDate[] = (data || []).map(d => ({
                    date: d.date,
                    status: (d.status as 'available' | 'unavailable') || 'unavailable',
                    event: d.event || undefined,
                    description: d.description || undefined,
                }));

                set({ calendarDates: formattedDates });
            },

            fetchRequestsCount: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                // 1. Get company name
                const { data: companyData } = await supabase
                    .from('companies')
                    .select('company')
                    .eq('user_id', userId)
                    .single();

                let reqCount = 0;
                if (companyData?.company) {
                    const { count } = await supabase
                        .from('requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_name', companyData.company);
                    reqCount = count || 0;
                }

                // 2. Get pending inquiries (via user profile)
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('user_id', userId)
                    .single();

                let inquiriesCount = 0;
                if (profile?.id) {
                    const { count: iCount } = await supabase
                        .from('event_inquiry_items')
                        .select('*', { count: 'exact', head: true })
                        .eq('vendor_id', profile.id)
                        .eq('status', 'PENDING');
                    inquiriesCount = iCount || 0;
                }

                set({ requestsCount: reqCount, pendingInquiries: inquiriesCount });
            },

            fetchReviews: async (limit?: number) => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                let query = supabase
                    .from('reviews')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('created_at', { ascending: false });

                if (limit) query = query.limit(limit);

                const { data, error } = await query;
                if (error) {
                    logger.error('Error fetching reviews:', error);
                }

                const reviewsList = data || [];

                // Calculate stats
                let stats = {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };

                if (reviewsList.length > 0) {
                    const sum = reviewsList.reduce((acc: number, r: any) => acc + r.rating, 0);
                    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    reviewsList.forEach((r: any) => {
                        const rating = Math.floor(r.rating);
                        if (rating >= 1 && rating <= 5) {
                            (dist as any)[rating]++;
                        }
                    });
                    stats = {
                        totalReviews: reviewsList.length,
                        averageRating: Math.round((sum / reviewsList.length) * 10) / 10,
                        ratingDistribution: dist
                    };
                }

                set({ reviews: reviewsList, reviewStats: stats });
            },

            setOrders: (orders) => set({ orders }),
            incrementNewOrderCount: () => set((s) => ({ newOrderCount: s.newOrderCount + 1 })),
            resetNewOrderCount: () => set({ newOrderCount: 0 }),
            updateOrderInStore: (orderId, updates) => set((s) => ({
                orders: s.orders.map((o: Order) => o.id === orderId ? { ...o, ...updates } : o),
            })),
        }),
        {
            name: 'dutuk-vendor-data-storage',
            storage: createJSONStorage(() => zustandMMKVStorage),
        }
    )
);

// =====================================================
// SELECTORS
// =====================================================

export const useUpcomingEvents = () => useVendorStore((s) => s.allEvents.filter((e: any) => e.status === 'upcoming'));
export const useOngoingEvents = () => useVendorStore((s) => s.allEvents.filter((e: any) => e.status === 'ongoing'));
export const useCompletedEvents = () => useVendorStore((s) => s.allEvents.filter((e: any) => e.status === 'completed'));
export const useManageableEvents = () => useVendorStore((s) => s.allEvents.filter((e: any) => e.status !== 'completed'));
