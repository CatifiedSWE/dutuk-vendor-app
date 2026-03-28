import type { CalendarDate, Event } from '@/features/events/types';
import type { VendorReview } from '@/features/profile/types';
import { supabase } from '@/services/supabase';
import type { Company } from '@/types';

export interface VendorDashboardResponse {
    company: Company;
    events: Event[];
    availability: CalendarDate[];
    requests_count: number;
    inquiries_count: number;
    review_stats: {
        average_rating: number;
        total_reviews: number;
    };
    recent_reviews: VendorReview[];
    services: any[];
    portfolio: any[];
    orders: any[];
    conversations: any[];
    synced_at: string;
}

export async function fetchVendorDashboard(): Promise<VendorDashboardResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_vendor_dashboard', {
        p_vendor_id: user.id
    });

    if (error) throw error;
    return data;
}
