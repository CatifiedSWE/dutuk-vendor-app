import { supabase } from '@/services/supabase';
import type { Company } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import type { CreateServiceParams, PortfolioItem, Service, UpdateServiceParams, VendorReview } from './types';

async function getVendorId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw error || new Error('Not authenticated');
    return data.user.id;
}

// ── Company ────────────────────────────────────────

export async function fetchCompanyInfo(): Promise<Company> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', vendorId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateCompanyInfo(updates: Partial<Company>): Promise<Company> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', vendorId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ── Services ────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createService(params: CreateServiceParams): Promise<Service> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('services')
        .insert({
            vendor_id: vendorId,
            name: params.name,
            description: params.description || null,
            price: params.price || null,
            price_type: params.price_type || null,
            duration_hours: params.duration_hours || null,
            is_active: params.is_active ?? true,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateService(id: string, params: UpdateServiceParams): Promise<void> {
    const { error } = await supabase
        .from('services')
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
}

// ── Portfolio ────────────────────────────────────────

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function deletePortfolioItem(id: string): Promise<void> {
    // Get item to delete from storage
    const { data: item } = await supabase
        .from('portfolio_items')
        .select('image_url')
        .eq('id', id)
        .single();

    if (item?.image_url) {
        const path = item.image_url.split('/storage/v1/object/public/')[1];
        if (path) {
            const [bucket, ...rest] = path.split('/');
            await supabase.storage.from(bucket).remove([rest.join('/')]);
        }
    }

    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) throw error;
}

// ── Image Upload ────────────────────────────────────

export async function pickAndUploadImage(
    bucket: 'profile-images' | 'event-images',
    folder?: string
): Promise<string | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') throw new Error('Photo library permission required');

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];

    // Compress
    const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Upload
    const vendorId = await getVendorId();
    const fileName = `${Date.now()}.jpg`;
    const filePath = folder ? `${vendorId}/${folder}/${fileName}` : `${vendorId}/${fileName}`;

    const response = await fetch(manipulated.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

// ── Reviews ────────────────────────────────────────

export async function fetchReviews(): Promise<VendorReview[]> {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      customer:customer_profiles!customer_id (full_name, avatar_url)
    `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((r) => ({
        id: r.id,
        vendor_id: r.vendor_id,
        customer_id: r.customer_id,
        customer_name: (r.customer as Record<string, unknown>)?.full_name as string || 'Customer',
        customer_avatar: (r.customer as Record<string, unknown>)?.avatar_url as string | null,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
    }));
}

export async function fetchPastEarnings() {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('earning_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

// ── Payments ────────────────────────────────────────

export async function fetchPastPayments() {
    const vendorId = await getVendorId();
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
