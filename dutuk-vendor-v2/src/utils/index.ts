import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, pattern) : dateString;
}

/**
 * Format a date string to a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateString: string): string {
    const date = parseISO(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : dateString;
}

/**
 * Format a number as currency.
 */
export function formatCurrency(amount: number, currency = 'LKR'): string {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
