import { supabase } from "@/utils/supabase";

const sendOTP = async (email: any) => {
  console.log("Sending OTP to:", email);
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create user if they don't exist
    }
  });
  
  if (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
  
  console.log("OTP sent successfully:", data);
  return data;
};

export default sendOTP;
