import { supabase } from '@/services/supabase';
import { useUIStore } from '@/store/uiStore';
import { useVendorStore } from '@/store/vendorStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { syncDashboard } from '../dashboard/hooks';
import * as chatApi from './api';

const CONVERSATIONS_KEY = ['conversations'];
const messagesKey = (id: string) => ['messages', id];

export function useConversations() {
    const conversations = useVendorStore((state) => state.conversations);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: conversations,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useMessages(conversationId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: messagesKey(conversationId),
        queryFn: () => chatApi.fetchMessages(conversationId),
        enabled: !!conversationId,
    });

    // Real-time message subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: messagesKey(conversationId) });
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [conversationId, queryClient]);

    return query;
}

export function useSendMessage(conversationId: string) {
    const queryClient = useQueryClient();
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (content: string) => chatApi.sendMessage(conversationId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: messagesKey(conversationId) });
            // Instead of invalidating conversations query, we sync dashboard 
            // to update last message/timestamp in the store
            syncDashboard();
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Send Failed', message: error.message });
        },
    });
}

export function useMarkRead(conversationId: string) {
    return useMutation({
        mutationFn: () => chatApi.markConversationRead(conversationId),
        onSuccess: () => {
            syncDashboard();
        }
    });
}

export function useTypingIndicator(conversationId: string) {
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const startTyping = useCallback(async () => {
        await chatApi.setTypingStatus(conversationId, true);

        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(async () => {
            await chatApi.setTypingStatus(conversationId, false);
        }, 3000);
    }, [conversationId]);

    const stopTyping = useCallback(async () => {
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        await chatApi.setTypingStatus(conversationId, false);
    }, [conversationId]);

    useEffect(() => {
        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, []);

    return { startTyping, stopTyping };
}

export function useConversationsRealtime() {
    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;

        const setupSubscription = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            channel = supabase
                .channel('conversation-updates')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // INSERT, UPDATE, DELETE
                        schema: 'public',
                        table: 'conversations',
                        filter: `vendor_id=eq.${userData.user.id}`,
                    },
                    () => {
                        syncDashboard();
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            channel?.unsubscribe();
        };
    }, []);
}
