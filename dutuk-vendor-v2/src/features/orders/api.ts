import { supabase } from '@/services/supabase';
import { formatDate } from '@/utils';
import type { Order } from './types';

/**
 * Transform a raw database order row into an Order interface.
 * Since the RPC now joins with customer_profiles and returns the data directly,
 * this handles both direct orders table rows and RPC-transformed rows.
 */
function transformOrder(row: Record<string, unknown>, isNew = false): Order {
    return {
        id: row.id as string,
        title: (row.event_title as string) || (row.event_date as string) || 'Untitled Event',
        customerName: (row.customer_name as string) || 'Unknown',
        packageType: 'Standard',
        customerEmail: '',
        customerPhone: '',
        status: (row.status as Order['status']) || 'pending',
        date: formatDate(row.created_at as string),
        rawEventDate: (row.event_date as string) || (row.created_at as string),
        amount: row.amount as number | undefined,
        notes: row.notes as string | undefined,
        isNew,
    };
}

/**
 * Fetch all orders for the current vendor.
 */
export async function fetchOrders(): Promise<Order[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError || new Error('Not authenticated');

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', userData.user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => transformOrder(row));
}

/**
 * Update an order's status.
 */
export async function updateOrderStatus(orderId: string, status: 'approved' | 'rejected') {
    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) throw error;
}

/**
 * Get order details by ID.
 */
export async function getOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return transformOrder(data);
}
