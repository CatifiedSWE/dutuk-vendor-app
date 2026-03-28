import { useUIStore } from '@/store/uiStore';
import { useVendorStore } from '@/store/vendorStore';
import type { Company } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { syncDashboard } from '../dashboard/hooks';
import * as profileApi from './api';
import type { CreateServiceParams, UpdateServiceParams } from './types';

// ── Company ────────────────────────────────────────

export function useCompanyInfo() {
    const company = useVendorStore((state) => state.company);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: company,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useUpdateCompany() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (updates: Partial<Company>) => profileApi.updateCompanyInfo(updates),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Profile Updated' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Update Failed', message: error.message });
        },
    });
}

// ── Services ────────────────────────────────────────

export function useServices() {
    const services = useVendorStore((state) => state.services);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: services,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useCreateService() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (params: CreateServiceParams) => profileApi.createService(params),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Service Created' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useUpdateService() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: ({ id, params }: { id: string; params: UpdateServiceParams }) =>
            profileApi.updateService(id, params),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Service Updated' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useDeleteService() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (id: string) => profileApi.deleteService(id),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Service Deleted' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

// ── Portfolio ────────────────────────────────────────

export function usePortfolio() {
    const portfolio = useVendorStore((state) => state.portfolio);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: portfolio,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useDeletePortfolioItem() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (id: string) => profileApi.deletePortfolioItem(id),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Item Deleted' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

// ── Image Upload ────────────────────────────────────

export function useImageUpload() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: ({ bucket, folder }: { bucket: 'profile-images' | 'event-images'; folder?: string }) =>
            profileApi.pickAndUploadImage(bucket, folder),
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Upload Failed', message: error.message });
        },
    });
}

// ── Reviews ────────────────────────────────────────

export function useReviews() {
    const reviews = useVendorStore((state) => state.recent_reviews);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: reviews,
        isLoading,
        refetch: syncDashboard,
    };
}

// ── Earnings & Payments ────────────────────────────

export function useEarnings() {
    const earnings = useVendorStore((state) => state.earnings);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: earnings,
        isLoading,
        refetch: syncDashboard,
    };
}

export function usePayments() {
    const payments = useVendorStore((state) => state.payments);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: payments,
        isLoading,
        refetch: syncDashboard,
    };
}

/**
 * Hook that returns reviews with computed stats (average rating, total count).
 * Reads from local store — no network calls on mount.
 */
export function useVendorReviews(limit?: number) {
    const allReviews = useVendorStore((state) => state.recent_reviews);
    const stats = useVendorStore((state) => state.review_stats);
    const isLoading = useVendorStore((state) => state.isLoading);

    const reviews = useMemo(() => {
        return limit ? allReviews.slice(0, limit) : allReviews;
    }, [allReviews, limit]);

    const formattedStats = useMemo(() => ({
        averageRating: stats.average_rating,
        totalReviews: stats.total_reviews,
    }), [stats]);

    return {
        reviews,
        stats: formattedStats,
        isLoading,
        error: null,
        refetch: syncDashboard,
    };
}
