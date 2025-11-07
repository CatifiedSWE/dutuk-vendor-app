import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

/**
 * Sets the vendor role for a user in user_profiles table
 * This function checks if the user profile exists and creates one with 'vendor' role if not
 * Only assigns vendor role if registration originates from this app
 * 
 * @returns Promise<boolean> - Returns true if role was set/already exists, false on error
 */
const setRole = async (): Promise<boolean> => {
  try {
    const user = await getUser();

    if (!user) {
      console.error("No user found when attempting to set role");
      return false;
    }

    // Check if user profile already exists in user_profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id, user_id, role")
      .eq("user_id", user.id)
      .single();

    // PGRST116 means "Result contains 0 rows" - this is expected for new users
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Unexpected fetch error from user_profiles:", fetchError);
      return false;
    }

    // If profile doesn't exist, create one with vendor role
    if (!existingProfile) {
      console.log("Creating new user profile with vendor role for user:", user.id);
      
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          role: "vendor",
        });

      if (insertError) {
        console.error("Error inserting user profile:", insertError);
        return false;
      }

      console.log("Successfully created vendor profile for user:", user.id);
      return true;
    }

    // Profile already exists
    console.log("User profile already exists with role:", existingProfile.role);
    return true;
  } catch (error) {
    console.error("Unexpected error in setRole:", error);
    return false;
  }
};

export default setRole;
