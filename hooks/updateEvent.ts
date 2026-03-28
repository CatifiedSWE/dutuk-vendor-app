import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type UpdateEventPayload = {
  event?: string;
  description?: string | null;
  status?: EventStatus;
  payment?: number;
  date?: string[];
  image_url?: string | null;
  banner_url?: string | null;
};

const updateEvent = async (eventId: string, payload: UpdateEventPayload) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const userId = useAuthStore.getState().userId;
    if (!userId) {
      throw new Error("No authenticated user");
    }

    const updates: UpdateEventPayload & { updated_at?: string } = { ...payload };
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .eq("vendor_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Refresh the vendor store events after update
    const { useVendorStore } = require('@/store/useVendorStore');
    await useVendorStore.getState().fetchEvents();

    return data;
  } catch (error) {
    logger.error("Error updating event:", error);
    throw error;
  }
};

export default updateEvent;

