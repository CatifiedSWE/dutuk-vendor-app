import { useAuthStore } from '@/store/useAuthStore';
import { useVendorStore } from '@/store/useVendorStore';
import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type CreateEventPayload = {
  event: string;
  description?: string;
  payment?: number;
  status?: EventStatus;
  startDate: string;
  endDate?: string;
  customerId?: string;
  customerName?: string;
  image_url?: string;
  banner_url?: string;
};

const createEvent = async (payload: CreateEventPayload) => {
  try {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      throw new Error("No authenticated user");
    }

    const companyName = useVendorStore.getState().company?.company || "My Company";

    const dateArray = payload.endDate && payload.endDate.length > 0
      ? [payload.startDate, payload.endDate]
      : [payload.startDate];

    if (!payload.event?.trim()) {
      throw new Error("Event title is required");
    }

    if (!payload.startDate) {
      throw new Error("Start date is required");
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        vendor_id: userId,
        company_name: companyName,
        customer_id: payload.customerId || userId,
        customer_name: payload.customerName || null,
        event: payload.event.trim(),
        description: payload.description?.trim() || null,
        date: dateArray,
        payment: payload.payment ?? 0,
        status: payload.status || "upcoming",
        image_url: payload.image_url || null,
        banner_url: payload.banner_url || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logger.error("Error creating event:", error);
    throw error;
  }
};

export default createEvent;

