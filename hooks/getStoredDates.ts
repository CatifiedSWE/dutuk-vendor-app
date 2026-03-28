import logger from '@/utils/logger';
import { supabase } from '@/utils/supabase';

export interface StoredDate {
    date: string;
    status: 'available' | 'unavailable';
    event?: string;
    description?: string;
}

/**
 * Fetches calendar availability dates for the current vendor from Supabase
 * @returns Array of StoredDate objects
 */
const getStoredDates = async (): Promise<StoredDate[]> => {
    try {
        // 1. Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            logger.error('Authentication error fetching dates:', authError);
            return [];
        }

        // 2. Query dates table for this user
        const { data, error } = await supabase
            .from('dates')
            .select('date, status, event, description')
            .eq('user_id', user.id)
            .order('date', { ascending: true });

        if (error) {
            logger.error('Error querying stored dates:', error);
            return [];
        }

        // 3. Transform and return results
        return (data || []).map(d => ({
            date: d.date,
            status: (d.status as 'available' | 'unavailable') || 'unavailable',
            event: d.event || undefined,
            description: d.description || undefined,
        }));

    } catch (err) {
        logger.error('Unexpected error in getStoredDates:', err);
        return [];
    }
};

export default getStoredDates;
