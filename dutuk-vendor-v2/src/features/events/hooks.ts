import { useUIStore } from '@/store/uiStore';
import { useVendorStore } from '@/store/vendorStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { syncDashboard } from '../dashboard/hooks';
import * as eventsApi from './api';
import type { CalendarDate, CreateEventParams, UpdateEventParams } from './types';

const EVENTS_KEY = ['events'];

// ── Read-only hooks (just read from store, no network) ──

export function useAllEvents() {
    const events = useVendorStore((state) => state.events);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: events,
        isLoading,
        refetch: syncDashboard,
    };
}

export function useCurrentEvents() {
    const events = useVendorStore((state) => state.events);
    const isLoading = useVendorStore((state) => state.isLoading);
    const now = new Date();

    const currentEvents = useMemo(() =>
        events.filter(e => {
            const date = new Date(e.start_date || e.created_at);
            return date.toDateString() === now.toDateString();
        }),
        [events]);

    return { data: currentEvents, isLoading };
}

export function useUpcomingEvents() {
    const events = useVendorStore((state) => state.events);
    const isLoading = useVendorStore((state) => state.isLoading);
    const now = new Date();

    const upcomingEvents = useMemo(() =>
        events.filter(e => new Date(e.start_date || e.created_at) > now),
        [events]);

    return { data: upcomingEvents, isLoading };
}

export function usePastEvents() {
    const events = useVendorStore((state) => state.events);
    const isLoading = useVendorStore((state) => state.isLoading);
    const now = new Date();

    const pastEvents = useMemo(() =>
        events.filter(e => new Date(e.end_date || e.start_date || e.created_at) < now || e.status === 'completed'),
        [events]);

    return { data: pastEvents, isLoading };
}

export function useEventById(eventId: string) {
    return useQuery({
        queryKey: [...EVENTS_KEY, eventId],
        queryFn: () => eventsApi.fetchEventById(eventId),
        enabled: !!eventId,
    });
}

export function useCalendarDates() {
    const availability = useVendorStore((state) => state.availability);
    const isLoading = useVendorStore((state) => state.isLoading);

    return {
        data: availability,
        isLoading,
        refetch: syncDashboard,
    };
}

// ── Mutation hooks (sync ONLY after CUD operations) ──

export function useCreateEvent() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (params: CreateEventParams) => eventsApi.createEvent(params),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Event Created' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useUpdateEvent() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: ({ eventId, params }: { eventId: string; params: UpdateEventParams }) =>
            eventsApi.updateEvent(eventId, params),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Event Updated' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useDeleteEvent() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Event Deleted' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}

export function useUpdateCalendar() {
    const { showToast } = useUIStore();

    return useMutation({
        mutationFn: (dates: CalendarDate[]) => eventsApi.storeDates(dates),
        onSuccess: () => {
            syncDashboard();
            showToast({ type: 'success', title: 'Calendar Updated' });
        },
        onError: (error: Error) => {
            showToast({ type: 'error', title: 'Failed', message: error.message });
        },
    });
}
