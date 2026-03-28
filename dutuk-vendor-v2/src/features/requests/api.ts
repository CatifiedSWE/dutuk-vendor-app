import { supabase } from '@/services/supabase';
import type { EventInquiry, Request } from './types';

async function getVendorId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw error || new Error('Not authenticated');
    return data.user.id;
}

export async function fetchRequests(): Promise<Request[]> {
    const vendorId = await getVendorId();
    // Get company name first since requests are linked by company_name
    const { data: companyData } = await supabase
        .from('companies')
        .select('company')
        .eq('user_id', vendorId)
        .single();

    if (!companyData?.company) return [];

    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('company_name', companyData.company)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((r) => ({
        id: r.id,
        customer_id: r.customer_id,
        vendor_id: vendorId, // requests table doesn't have vendor_id, we use the current vendor
        event_type: r.event,
        event_date: Array.isArray(r.date) ? r.date[0] : r.date,
        location: '', // requests table doesn't have location
        budget: Number(r.payment || 0),
        description: r.description,
        status: r.status,
        customer_name: r.customer_name || 'Customer',
        customer_email: r.customer_email || '',
        customer_phone: r.customer_phone || '',
        created_at: r.created_at,
    }));
}

export async function fetchRequestById(requestId: string): Promise<Request> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (error) throw error;

    return {
        id: data.id,
        customer_id: data.customer_id,
        vendor_id: vendorId,
        event_type: data.event,
        event_date: Array.isArray(data.date) ? data.date[0] : data.date,
        location: '',
        budget: Number(data.payment || 0),
        description: data.description,
        status: data.status,
        customer_name: data.customer_name || 'Customer',
        customer_email: data.customer_email || '',
        customer_phone: data.customer_phone || '',
        created_at: data.created_at,
    };
}

export async function acceptRequest(requestId: string): Promise<void> {
    const { error } = await supabase
        .from('requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) throw error;
}

export async function rejectRequest(requestId: string): Promise<void> {
    const { error } = await supabase
        .from('requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) throw error;
}

// fetchPastEarnings removed from here (it belongs in profile/api.ts)

export async function fetchInquiries(): Promise<EventInquiry[]> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('event_inquiry_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((i) => ({
        id: i.id,
        event_id: i.event_id,
        customer_id: i.vendor_id, // Inquiry items link to vendor, they don't have customer_id directly?
        message: '', // Add mapping as needed
        status: i.status,
        customer_name: (i.customer as any)?.full_name || 'Customer',
        created_at: i.created_at,
    }));
}

export async function fetchRequestsCount(): Promise<number> {
    const vendorId = await getVendorId();
    const { data: companyData } = await supabase
        .from('companies')
        .select('company')
        .eq('user_id', vendorId)
        .single();

    if (!companyData?.company) return 0;

    const { count, error } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('company_name', companyData.company)
        .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
}

export async function fetchPendingInquiriesCount(): Promise<number> {
    const vendorId = await getVendorId();
    const { count, error } = await supabase
        .from('event_inquiry_items')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('status', 'PENDING');

    if (error) throw error;
    return count || 0;
}
