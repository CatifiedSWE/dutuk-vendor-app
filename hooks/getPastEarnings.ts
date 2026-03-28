import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getPastEarnings = async () => {
    try {
        const user = await getUser();
        if (!user) {
            logger.error("No authenticated user");
            return [];
        }

        const { data: earnings, error } = await supabase
            .from("earnings")
            .select("*")
            .eq("vendor_id", user.id)
            .order("earning_date", { ascending: false });

        if (error) {
            logger.error("Error fetching past earnings:", error);
            return [];
        }

        return earnings || [];
    } catch (e) {
        logger.error("Exception fetching past earnings:", e);
        return [];
    }
};

export default getPastEarnings;