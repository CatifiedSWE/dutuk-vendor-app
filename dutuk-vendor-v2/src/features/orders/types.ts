export interface Order {
    id: string;
    title: string;
    customerName: string;
    packageType: string;
    customerEmail: string;
    customerPhone: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    date: string;
    rawEventDate: string;
    amount?: number;
    notes?: string;
    isNew?: boolean;
}
