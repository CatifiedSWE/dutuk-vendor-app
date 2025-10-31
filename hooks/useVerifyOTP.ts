import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "../utils/supabase";
import setRole from "./setVendorAsRoleOnRegister";

const verifyOTP = async (email: any, otp: any, route: any) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "magiclink", // Use magiclink type for OTP verification
  });

  if (error) {
    console.error("OTP verification error:", error);
    const errorMsg = "There is an error verifying OTP: " + error.message;
    Alert.alert("Verification Failed", errorMsg);
    throw error;
  } else {
    console.log("OTP verified successfully:", data);
    await setRole();
    Alert.alert("Success", "OTP verified successfully");
    router.replace(route);
  }
};

export default verifyOTP;
