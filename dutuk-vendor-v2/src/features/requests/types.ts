export interface Request {
    id: string;
    customer_id: string;
    vendor_id: string;
    event_type: string;
    event_date: string;
    location: string | null;
    budget: number | null;
    description: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    created_at: string;
}

export interface EventInquiry {
    id: string;
    event_id: string;
    customer_id: string;
    message: string;
    status: 'new' | 'read' | 'responded';
    customer_name: string;
    created_at: string;
}
