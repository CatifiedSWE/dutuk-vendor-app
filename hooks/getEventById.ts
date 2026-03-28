import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getEventById = async (eventId: string) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const user = await getUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("vendor_id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logger.error("Error fetching event by id:", error);
    throw error;
  }
};

export default getEventById;

