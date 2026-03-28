import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getPastPayments = async () => {
    try {
        const user = await getUser();
        if (!user) {
            logger.error("No authenticated user");
            return [];
        }

        const { data: payments, error } = await supabase
            .from("payments")
            .select("*")
            .eq("vendor_id", user.id)
            .eq("payment_status", "completed")
            .order("payment_date", { ascending: false });

        if (error) {
            logger.error("Error fetching past payments:", error);
            return [];
        }

        return payments || [];
    } catch (e) {
        logger.error("Exception fetching past payments:", e);
        return [];
    }
};

export default getPastPayments;