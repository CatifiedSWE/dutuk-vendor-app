import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getCurrentEvents = async () => {
    try {
        const user = await getUser();
        if (!user) {
            console.error("No authenticated user");
            return [];
        }

        const { data: events, error } = await supabase
            .from("events")
            .select("*")
            .eq("vendor_id", user.id)
            .eq("status", "ongoing")
            .order("start_date", { ascending: true });

        if (error) {
            console.error("Error fetching current events:", error);
            return [];
        }

        return events || [];
    } catch (e) {
        console.error("Exception fetching current events:", e);
        return [];
    }
};

export default getCurrentEvents;
