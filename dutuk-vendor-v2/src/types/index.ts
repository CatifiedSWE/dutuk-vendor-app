export interface Company {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    specializations: string[];
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'vendor' | 'customer' | 'admin';
}
