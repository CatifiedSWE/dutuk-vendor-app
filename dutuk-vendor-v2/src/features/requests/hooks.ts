import { useUIStore } from '@/store/uiStore';
import { useVendorStore } from '@/store/vendorStore';
import { useMutation } from '@tanstack/react-query';
import { syncDashboard } from '../dashboard/hooks';
import * as requestsApi from './api';

export function useRequests() {
    const requests = useVendorStore((state) => state.requests);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: requests,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useRequestById(requestId: string) {
    const requests = useVendorStore((state) => state.requests);
    const request = requests.find(r => r.id === requestId);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: request,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useAcceptRequest() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (requestId: string) => requestsApi.acceptRequest(requestId),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Request Accepted' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useRejectRequest() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (requestId: string) => requestsApi.rejectRequest(requestId),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Request Rejected' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useInquiries() {
    const inquiries = useVendorStore((state) => state.inquiries);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: inquiries,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useRequestsCount() {
    const count = useVendorStore((state) => state.requests_count);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: count,
        isLoading,
        refetch: syncDashboard,
    };
}

export function usePendingInquiriesCount() {
    const count = useVendorStore((state) => state.inquiries_count);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: count,
        isLoading,
        refetch: syncDashboard,
    };
}
