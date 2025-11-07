import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getUpcomingEvents = async () => {
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
            .eq("status", "upcoming")
            .order("start_date", { ascending: true });

        if (error) {
            console.error("Error fetching upcoming events:", error);
            return [];
        }

        return events || [];
    } catch (e) {
        console.error("Exception fetching upcoming events:", e);
        return [];
    }
};

export default getUpcomingEvents;
