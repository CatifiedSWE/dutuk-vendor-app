import { supabase } from '@/services/supabase';
import type { CalendarDate, CreateEventParams, Event, UpdateEventParams } from './types';

async function getVendorId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw error || new Error('Not authenticated');
    return data.user.id;
}

export async function fetchAllEvents(): Promise<Event[]> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function fetchCurrentEvents(): Promise<Event[]> {
    const vendorId = await getVendorId();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId)
        .gte('end_date', today)
        .in('status', ['upcoming', 'ongoing'])
        .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function fetchUpcomingEvents(): Promise<Event[]> {
    const vendorId = await getVendorId();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId)
        .gt('start_date', today)
        .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function fetchPastEvents(): Promise<Event[]> {
    const vendorId = await getVendorId();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId)
        .lt('end_date', today)
        .order('end_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function fetchEventById(eventId: string): Promise<Event> {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error) throw error;
    return data;
}

export async function createEvent(params: CreateEventParams): Promise<Event> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('events')
        .insert({ vendor_id: vendorId, ...params })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateEvent(eventId: string, params: UpdateEventParams): Promise<Event> {
    const { data, error } = await supabase
        .from('events')
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
}

// Calendar availability - uses 'dates' table
export async function fetchStoredDates(): Promise<CalendarDate[]> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('dates')
        .select('*')
        .eq('user_id', vendorId);

    if (error) throw error;
    return (data || []).map((d) => ({
        date: d.date,
        isAvailable: d.status === 'available',
        note: d.description,
    }));
}

export async function storeDates(dates: CalendarDate[]): Promise<void> {
    const vendorId = await getVendorId();
    const rows = dates.map((d) => ({
        user_id: vendorId,
        date: d.date,
        status: d.isAvailable ? 'available' : 'unavailable',
        description: d.note || null,
    }));

    const { error } = await supabase
        .from('dates')
        .upsert(rows, { onConflict: 'user_id,date' });

    if (error) throw error;
}
