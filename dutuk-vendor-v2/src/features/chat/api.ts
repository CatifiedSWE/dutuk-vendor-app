import { supabase } from '@/services/supabase';
import type { Conversation, Message } from './types';

async function getVendorId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw error || new Error('Not authenticated');
    return data.user.id;
}

export async function fetchConversations(): Promise<Conversation[]> {
    const vendorId = await getVendorId();

    // conversations.customer_id FK → auth.users, 
    // so we join through customer_profiles for name/avatar
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Gather unique customer IDs to fetch profiles
    const customerIds = [...new Set((data || []).map((c) => c.customer_id))];
    const profileMap: Record<string, { full_name: string; avatar_url: string | null }> = {};

    if (customerIds.length > 0) {
        const { data: profiles } = await supabase
            .from('customer_profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', customerIds);

        (profiles || []).forEach((p) => {
            profileMap[p.user_id] = { full_name: p.full_name || 'Customer', avatar_url: p.avatar_url };
        });
    }

    return (data || []).map((c) => ({
        id: c.id,
        customer_id: c.customer_id,
        vendor_id: c.vendor_id,
        last_message: c.last_message_preview || '',
        last_message_at: c.last_message_at,
        customer_name: profileMap[c.customer_id]?.full_name || 'Customer',
        customer_avatar: profileMap[c.customer_id]?.avatar_url || null,
        unread_count: 0,
    }));
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
    const vendorId = await getVendorId();

    // Fetch the conversation to know the customer_id
    const { data: conv } = await supabase
        .from('conversations')
        .select('customer_id')
        .eq('id', conversationId)
        .single();

    // Fetch the customer profile for name
    let customerName = 'Customer';
    if (conv?.customer_id) {
        const { data: profile } = await supabase
            .from('customer_profiles')
            .select('full_name')
            .eq('user_id', conv.customer_id)
            .single();
        if (profile?.full_name) customerName = profile.full_name;
    }

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;

    return (data || []).map((m) => ({
        _id: m.id,
        text: m.message_text || '',
        createdAt: new Date(m.created_at),
        user: {
            _id: m.sender_id,
            name: m.sender_id === vendorId ? 'You' : customerName,
        },
        image: m.has_attachment && m.attachment_type?.startsWith('image') ? m.attachment_url : undefined,
        video: m.has_attachment && m.attachment_type?.startsWith('video') ? m.attachment_url : undefined,
    }));
}

export async function sendMessage(conversationId: string, content: string) {
    const vendorId = await getVendorId();

    // Get the conversation to find the receiver (customer)
    const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('customer_id')
        .eq('id', conversationId)
        .single();

    if (convError) throw convError;

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: vendorId,
            receiver_id: conv.customer_id,
            message_text: content,
        })
        .select()
        .single();

    if (error) throw error;

    // Update conversation last_message_preview
    await supabase
        .from('conversations')
        .update({
            last_message_preview: content,
            last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    return data;
}

export async function markConversationRead(conversationId: string) {
    const vendorId = await getVendorId();

    // Mark all unread messages in this conversation as read
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', vendorId)
        .eq('is_read', false);

    if (error) throw error;
}

export async function setTypingStatus(conversationId: string, isTyping: boolean) {
    // Typing is tracked on the conversations table via vendor_typing_at
    const { error } = await supabase
        .from('conversations')
        .update({
            vendor_typing_at: isTyping ? new Date().toISOString() : null,
        })
        .eq('id', conversationId);

    if (error) throw error;
}

export async function uploadAttachment(
    conversationId: string,
    fileUri: string,
    fileName: string
): Promise<string> {
    const vendorId = await getVendorId();
    const filePath = `chat/${conversationId}/${vendorId}/${Date.now()}_${fileName}`;

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, blob, { contentType: blob.type });

    if (error) throw error;

    const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
    return data.publicUrl;
}
