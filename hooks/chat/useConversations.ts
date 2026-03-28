import logger from '@/utils/logger';
import getUser from '@/hooks/getUser';
import { supabase } from '@/utils/supabase';
import { useCallback, useEffect, useState } from 'react';

// =====================================================
// TYPES
// =====================================================

export interface Conversation {
    id: string;
    customer_id: string;
    vendor_id: string;
    terms_accepted_by_customer: boolean;
    terms_accepted_at: string | null;
    payment_completed: boolean;
    payment_completed_at: string | null;
    booking_id: string | null;
    last_message_at: string;
    last_message_preview: string | null;
    created_at: string;
    updated_at: string;

    // Joined data from view
    customer_name: string | null;
    customer_avatar: string | null;
    customer_email: string | null;
    vendor_name: string | null;
    vendor_avatar: string | null;
    vendor_company: string | null;
    vendor_email: string | null;
}

export interface ConversationWithUnread extends Conversation {
    unread_count: number;
}

// =====================================================
// HOOK: useVendorConversations
// =====================================================

/**
 * Fetches all conversations for the current vendor
 * Includes real-time updates via Supabase Realtime
 * 
 * @returns Object with conversations, loading state, error, and refetch function
 */
export function useVendorConversations() {
    const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchConversations = useCallback(async (vendorId: string) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch conversations with user details
            const { data: conversationsData, error: conversationsError } = await supabase
                .from('conversations_with_users')
                .select('*')
                .eq('vendor_id', vendorId)
                .order('last_message_at', { ascending: false });

            if (conversationsError) throw conversationsError;

            // Fetch unread counts
            const { data: unreadData, error: unreadError } = await supabase
                .rpc('get_unread_count', { user_id_param: vendorId });

            if (unreadError) {
                logger.warn('Error fetching unread counts:', unreadError);
            }

            // Merge unread counts with conversations
            const conversationsWithUnread: ConversationWithUnread[] = (conversationsData || []).map((conv: Conversation) => {
                const unreadInfo = unreadData?.find((u: any) => u.conversation_id === conv.id);
                return {
                    ...conv,
                    unread_count: unreadInfo?.unread_count || 0,
                };
            });

            setConversations(conversationsWithUnread);
        } catch (err: any) {
            logger.error('Error fetching conversations:', err);
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    // Get current user and fetch conversations
    useEffect(() => {
        const initializeConversations = async () => {
            try {
                const user = await getUser();
                if (user?.id) {
                    setUserId(user.id);
                    await fetchConversations(user.id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                logger.error('Error getting user:', err);
                setLoading(false);
            }
        };

        initializeConversations();
    }, [fetchConversations]);

    // Real-time subscription for conversation updates
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel('vendor-conversations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: `vendor_id=eq.${userId}`,
                },
                () => {
                    // Refetch conversations on any change
                    fetchConversations(userId);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    // Refetch on new messages to update last_message and unread counts
                    fetchConversations(userId);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchConversations]);

    const refetch = useCallback(() => {
        if (userId) {
            fetchConversations(userId);
        }
    }, [userId, fetchConversations]);

    // Calculate total unread count
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

    return {
        conversations,
        loading,
        error,
        refetch,
        totalUnread,
    };
}

// =====================================================
// HOOK: useConversation
// =====================================================

/**
 * Fetches a single conversation by ID
 * 
 * @param conversationId - The conversation ID
 * @returns Object with conversation, loading state, and error
 */
export function useConversation(conversationId: string | null) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!conversationId) {
            setConversation(null);
            setLoading(false);
            return;
        }

        const fetchConversation = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('conversations_with_users')
                    .select('*')
                    .eq('id', conversationId)
                    .single();

                if (fetchError) throw fetchError;

                setConversation(data);
            } catch (err: any) {
                logger.error('Error fetching conversation:', err);
                setError(err.message || 'Failed to load conversation');
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId]);

    return { conversation, loading, error };
}
