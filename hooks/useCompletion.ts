import { useAuthStore } from '@/store/useAuthStore';
import { useVendorStore } from '@/store/useVendorStore';
import logger from '@/utils/logger';
import { supabase } from '@/utils/supabase';
import { useCallback, useState } from 'react';

// =====================================================
// HOOK: useRequestCompletion
// Vendor-side: send a completion request through chat
// =====================================================

interface RequestCompletionParams {
    /** The conversation the vendor is currently in */
    conversationId: string;
    /** The customer's user ID (message receiver) */
    customerId: string;
    /** The event being completed */
    eventId: string;
}

export function useRequestCompletion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const updateEventInStore = useVendorStore((s) => s.updateEventInStore);

    const requestCompletion = useCallback(
        async (params: RequestCompletionParams): Promise<{ success: boolean; error?: string }> => {
            const { conversationId, customerId, eventId } = params;
            const vendorId = useAuthStore.getState().userId;

            if (!vendorId) {
                return { success: false, error: 'Not authenticated' };
            }

            try {
                setLoading(true);
                setError(null);

                const now = new Date().toISOString();

                // 1. Insert completion_request message into chat
                const { error: msgError } = await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_id: vendorId,
                    receiver_id: customerId,
                    message_text: '📋 Completion Request',
                    message_type: 'completion_request',
                    event_id: eventId,
                    has_attachment: false,
                });

                if (msgError) throw msgError;

                // 2. Transition event status to completion_requested
                const { error: eventError } = await supabase
                    .from('events')
                    .update({
                        status: 'completion_requested',
                        completion_requested_at: now,
                        completion_requested_by: vendorId,
                    })
                    .eq('id', eventId)
                    .eq('vendor_id', vendorId); // vendor can only update their own events

                if (eventError) throw eventError;

                // 3. Optimistically update the local store
                updateEventInStore(eventId, {
                    status: 'completion_requested',
                    completion_requested_at: now,
                    completion_requested_by: vendorId,
                });

                return { success: true };
            } catch (err: any) {
                logger.error('Error requesting completion:', err);
                const msg = err.message || 'Failed to request completion';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        [updateEventInStore]
    );

    return { requestCompletion, loading, error };
}

// =====================================================
// HOOK: useConfirmCompletion
// Customer-side: confirm via SECURITY DEFINER RPC
// (used in customer app — included here for completeness)
// =====================================================

export function useConfirmCompletion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmCompletion = useCallback(
        async (eventId: string): Promise<{ success: boolean; error?: string }> => {
            try {
                setLoading(true);
                setError(null);

                const { error: rpcError } = await supabase.rpc('confirm_event_completion', {
                    event_id_param: eventId,
                });

                if (rpcError) throw rpcError;

                return { success: true };
            } catch (err: any) {
                logger.error('Error confirming completion:', err);
                const msg = err.message || 'Failed to confirm completion';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { confirmCompletion, loading, error };
}
