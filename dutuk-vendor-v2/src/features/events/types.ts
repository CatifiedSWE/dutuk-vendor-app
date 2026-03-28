export interface Event {
    id: string;
    vendor_id: string;
    customer_id: string;
    customer_name: string | null;
    company_name: string;
    event: string;
    description: string | null;
    date: string[];
    payment: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    image_url: string | null;
    banner_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateEventParams {
    customer_id: string;
    customer_name?: string;
    company_name: string;
    event: string;
    description?: string;
    date: string[];
    payment?: number;
    start_date?: string;
    end_date?: string;
    image_url?: string;
    banner_url?: string;
}

export interface UpdateEventParams extends Partial<CreateEventParams> {
    status?: Event['status'];
}

export interface CalendarDate {
    date: string;
    isAvailable: boolean;
    note?: string;
}
