import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import setRole from "./setVendorAsRoleOnRegister";

const loginUser = async (userEmail: string, userPassword: string) => {
  console.log('Attempting login for:', userEmail);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  });

  if (error) {
    console.log('Login error:', error);
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials")) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Wrong email or password.'
      });
    } else if (message.includes("user not found")) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'User does not exist.'
      });
    } else if (message.includes("email not confirmed")) {
      Toast.show({
        type: 'error',
        text1: 'Email Not Verified',
        text2: 'Please check your email and verify your account first.'
      });
      // Optionally redirect to OTP page
      router.push(`/auth/OtpPage?email=${encodeURIComponent(userEmail)}`);
      return;
    } else if (message.includes("signup disabled")) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Account registration is required.'
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message
      });
    }

    throw error;
  }

  console.log('Login successful for:', data.user?.email);
  
  await setRole();
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: 'Login successful!'
  });
  router.replace("/(tabs)");
};

export default loginUser;
