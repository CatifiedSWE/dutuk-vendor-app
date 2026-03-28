import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getUpcomingEvents = async () => {
    try {
        const user = await getUser();
        if (!user) {
            logger.error("No authenticated user");
            return [];
        }

        const { data: events, error } = await supabase
            .from("events")
            .select("*")
            .eq("vendor_id", user.id)
            .eq("status", "upcoming")
            .order("start_date", { ascending: true });

        if (error) {
            logger.error("Error fetching upcoming events:", error);
            return [];
        }

        return events || [];
    } catch (e) {
        logger.error("Exception fetching upcoming events:", e);
        return [];
    }
};

export default getUpcomingEvents;
