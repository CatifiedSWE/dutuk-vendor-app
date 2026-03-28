import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const deleteEvent = async (eventId: string) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const user = await getUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("vendor_id", user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    logger.error("Error deleting event:", error);
    throw error;
  }
};

export default deleteEvent;

