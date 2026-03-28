import { supabase } from './supabase';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

export class ApiClientError extends Error {
    status?: number;
    code?: string;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiClientError';
        this.status = error.status;
        this.code = error.code;
    }
}

/**
 * Get the current auth token from Supabase session.
 */
async function getAuthToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

/**
 * Centralized API client wrapping fetch.
 * Automatically attaches auth tokens, normalizes errors,
 * and provides consistent request handling.
 */
export async function apiRequest<T = unknown>(
    url: string,
    options: {
        method?: HttpMethod;
        body?: Record<string, unknown>;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    } = {}
): Promise<T> {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (!skipAuth) {
        const token = await getAuthToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new ApiClientError({
                message: errorBody.message || `Request failed with status ${response.status}`,
                status: response.status,
                code: errorBody.code,
            });
        }

        return response.json() as Promise<T>;
    } catch (error) {
        if (error instanceof ApiClientError) throw error;
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiClientError({ message: 'Request timed out', status: 408 });
        }
        throw new ApiClientError({
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    } finally {
        clearTimeout(timeoutId);
    }
}
