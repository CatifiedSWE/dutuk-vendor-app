import { Conversation } from '@/features/chat/types';
import type { CalendarDate, Event } from '@/features/events/types';
import type { Order } from '@/features/orders/types';
import type { VendorReview } from '@/features/profile/types';
import type { EventInquiry, Request } from '@/features/requests/types';
import type { Company } from '@/types';
import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

const storage = createMMKV();

const mmkvStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value);
    },
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => {
        return storage.remove(name);
    },
};

interface ReviewStats {
    average_rating: number;
    total_reviews: number;
}

interface VendorDashboardData {
    company: Company | null;
    events: Event[];
    availability: CalendarDate[];
    requests_count: number;
    inquiries_count: number;
    requests: Request[];
    inquiries: EventInquiry[];
    review_stats: ReviewStats;
    recent_reviews: VendorReview[];
    services: any[];
    portfolio: any[];
    orders: Order[];
    conversations: Conversation[];
    earnings: any | null;
    payments: any[];
    synced_at: string | null;
}

interface VendorState extends VendorDashboardData {
    isLoading: boolean;
    error: string | null;

    // Actions
    setDashboardData: (data: Partial<VendorDashboardData>) => void;
    setOrders: (orders: Order[]) => void;
    setConversations: (conversations: Conversation[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (order: Order) => void;
    removeOrder: (orderId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState: VendorDashboardData = {
    company: null,
    events: [],
    availability: [],
    requests_count: 0,
    inquiries_count: 0,
    requests: [],
    inquiries: [],
    review_stats: { average_rating: 0, total_reviews: 0 },
    recent_reviews: [],
    services: [],
    portfolio: [],
    orders: [],
    conversations: [],
    earnings: null,
    payments: [],
    synced_at: null,
};

export const useVendorStore = create<VendorState>()(
    persist(
        (set) => ({
            ...initialState,
            isLoading: false,
            error: null,

            setDashboardData: (data) => set((state) => ({ ...state, ...data })),
            setOrders: (orders) => set({ orders }),
            setConversations: (conversations) => set({ conversations }),
            addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
            updateOrder: (order) => set((state) => ({
                orders: state.orders.map(o => o.id === order.id ? order : o)
            })),
            removeOrder: (orderId) => set((state) => ({
                orders: state.orders.filter(o => o.id !== orderId)
            })),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            reset: () => set({ ...initialState, error: null, isLoading: false }),
        }),
        {
            name: 'vendor-storage-v3',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
