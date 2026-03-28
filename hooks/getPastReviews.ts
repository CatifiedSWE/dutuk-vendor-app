import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getPastReviews = async () => {
    try {
        const user = await getUser();
        if (!user) {
            logger.error("No authenticated user");
            return [];
        }

        const { data: reviews, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("vendor_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching past reviews:", error);
            return [];
        }

        return reviews || [];
    } catch (e) {
        logger.error("Exception fetching past reviews:", e);
        return [];
    }
};

export default getPastReviews;