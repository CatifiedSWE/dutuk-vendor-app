import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

/**
 * Creates vendor profile and company entry for a user
 * This function ensures both user_profiles and companies tables are populated
 * Used for vendor registration from this app
 * 
 * @param companyName - Optional company name (used for Google OAuth with user's display name)
 * @returns Promise<boolean> - Returns true if entries were created/already exist, false on error
 */
const setRole = async (companyName?: string | null): Promise<boolean> => {
  try {
    const user = await getUser();

    if (!user) {
      console.error("No user found when attempting to create vendor profile");
      return false;
    }

    console.log("Setting up vendor profile for user:", user.id);

    // Step 1: Ensure user_profiles entry exists
    // Check if user profile already exists
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from("user_profiles")
      .select("id, user_id, role")
      .eq("user_id", user.id)
      .single();

    // PGRST116 means "Result contains 0 rows" - this is expected for new users
    if (profileFetchError && profileFetchError.code !== "PGRST116") {
      console.error("Unexpected fetch error from user_profiles:", profileFetchError);
      return false;
    }

    // If profile doesn't exist, create one
    if (!existingProfile) {
      console.log("Creating new user_profiles entry for user:", user.id);
      
      const { error: profileInsertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          role: "vendor",
        });

      if (profileInsertError) {
        // Check if error is due to trigger already creating the profile (race condition)
        if (profileInsertError.code === "23505") {
          console.log("User profile already exists (created by trigger), continuing...");
        } else {
          console.error("Error inserting user_profiles entry:", profileInsertError);
          return false;
        }
      } else {
        console.log("Successfully created user_profiles entry for user:", user.id);
      }
    } else {
      console.log("User profile already exists:", existingProfile.role);
    }

    // Step 2: Ensure companies entry exists
    // Check if company entry already exists
    const { data: existingCompany, error: companyFetchError } = await supabase
      .from("companies")
      .select("id, user_id, company")
      .eq("user_id", user.id)
      .single();

    // PGRST116 means "Result contains 0 rows" - this is expected for new users
    if (companyFetchError && companyFetchError.code !== "PGRST116") {
      console.error("Unexpected fetch error from companies:", companyFetchError);
      return false;
    }

    // If company doesn't exist, create one
    if (!existingCompany) {
      console.log("Creating new company entry for vendor user:", user.id);
      
      // Use provided company name or user's email as fallback
      const defaultCompanyName = companyName || user.user_metadata?.full_name || null;
      
      const { error: companyInsertError } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          company: defaultCompanyName || "My Company", // Use provided name or default
          mail: user.email,
        });

      if (companyInsertError) {
        console.error("Error inserting company entry:", companyInsertError);
        return false;
      }

      console.log("Successfully created company entry for vendor:", user.id);
      return true;
    }

    // Company already exists
    console.log("Company entry already exists:", existingCompany.company);
    return true;
  } catch (error) {
    console.error("Unexpected error in setRole:", error);
    return false;
  }
};

export default setRole;
