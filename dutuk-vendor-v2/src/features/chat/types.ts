export interface Conversation {
    id: string;
    customer_id: string;
    vendor_id: string;
    last_message: string | null;
    last_message_at: string | null;
    customer_name: string;
    customer_avatar: string | null;
    unread_count: number;
}

export interface Message {
    _id: string;
    text: string;
    createdAt: Date;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    };
    image?: string;
    video?: string;
}

export interface Attachment {
    id: string;
    message_id: string;
    url: string;
    type: 'image' | 'video' | 'document';
    filename: string;
}
