/**
 * Shared Calendar Availability Logic
 * Single source of truth for availability/unavailability computation.
 */

import type { MarkedDate, MarkedDatesMap } from '@/components/UnifiedCalendar';
import type { CalendarDate } from '@/features/events/types';

export type { MarkedDate, MarkedDatesMap };

/**
 * Converts calendar dates (from database) to marked dates format for UnifiedCalendar.
 */
export function buildAvailabilityMarkedDates(calendarDates: CalendarDate[]): MarkedDatesMap {
    const markedDates: MarkedDatesMap = {};

    calendarDates.forEach((calDate) => {
        if (!calDate.isAvailable) {
            markedDates[calDate.date] = { unavailable: true };
        } else {
            markedDates[calDate.date] = { available: true };
        }
    });

    return markedDates;
}

/**
 * Merges availability data with event markers.
 */
export function mergeAvailabilityWithEvents(
    availabilityMarkedDates: MarkedDatesMap,
    eventMarkedDates: MarkedDatesMap,
): MarkedDatesMap {
    const merged: MarkedDatesMap = { ...availabilityMarkedDates };

    Object.keys(eventMarkedDates).forEach((dateKey) => {
        merged[dateKey] = {
            ...merged[dateKey],
            ...eventMarkedDates[dateKey],
        };
    });

    return merged;
}

/**
 * Creates marked dates for order booking dates.
 */
export function buildOrderBookingMarkedDates(
    bookingDateString: string,
    eventColor = '#800000',
): MarkedDatesMap {
    return {
        [bookingDateString]: { hasEvent: true, eventColor },
    };
}
