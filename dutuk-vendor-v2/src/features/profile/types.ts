export interface Service {
    id: string;
    vendor_id: string;
    name: string;
    description: string | null;
    price: number | null;
    price_type: 'fixed' | 'starting_from' | 'hourly' | 'per_event' | 'custom' | null;
    duration_hours: number | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateServiceParams {
    name: string;
    description?: string;
    price?: number;
    price_type?: Service['price_type'];
    duration_hours?: number;
    is_active?: boolean;
}

export interface UpdateServiceParams extends Partial<CreateServiceParams> {
    sort_order?: number;
}

export interface PortfolioItem {
    id: string;
    vendor_id: string;
    title: string | null;
    description: string | null;
    image_url: string;
    thumbnail_url: string | null;
    event_type: string | null;
    event_date: string | null;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface VendorReview {
    id: string;
    vendor_id: string;
    customer_id: string;
    customer_name: string;
    customer_avatar: string | null;
    rating: number;
    comment: string | null;
    created_at: string;
}
