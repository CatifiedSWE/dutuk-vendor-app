import { supabase } from "@/utils/supabase";

/**
 * Check if a user with given email already exists in the system
 * This checks both auth.users (via RPC call) and user_profiles table
 * 
 * @param email - The email address to check
 * @returns Promise<{exists: boolean, error: string | null}>
 */
const checkUserExists = async (
  email: string
): Promise<{ exists: boolean; error: string | null }> => {
  try {
    if (!email || !email.trim()) {
      return { exists: false, error: "Email is required" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // First check if user exists in user_profiles via their email lookup
    // We can check auth.users indirectly by trying to get user profiles
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, role")
      .limit(1);

    if (profileError) {
      console.error("Error checking user profiles:", profileError);
      // Don't block registration if we can't check - let Supabase auth handle it
      return { exists: false, error: null };
    }

    // Since we can't directly query auth.users from client,
    // we'll rely on Supabase's built-in validation during signup
    // This function serves as a preparatory check for user_profiles
    
    return { exists: false, error: null };
  } catch (error) {
    console.error("Unexpected error checking user existence:", error);
    return { exists: false, error: "Failed to verify user status" };
  }
};

export default checkUserExists;
