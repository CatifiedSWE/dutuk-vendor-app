import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { supabase } from "../utils/supabase";

const registerUser = async (userEmail: string, password: string) => {
  // First, try to sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: userEmail,
    password,
  });

  if (signUpError) {
    const message = signUpError.message.toLowerCase();
    
    if (message.includes("user already registered")) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'User already exists with this email.'
      });
    } else if (message.includes("password")) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Password must be at least 6 characters.'
      });
    } else if (message.includes("email")) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Please enter a valid email address.'
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: signUpError.message
      });
    }
    
    throw signUpError;
  }

  // Check if email confirmation is required
  if (signUpData?.user && !signUpData.user.email_confirmed_at) {
    // Email confirmation is required, send OTP
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: userEmail,
    });

    if (otpError) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send verification code. Please try again.'
      });
      throw otpError;
    }

    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Registration successful! Please check your email for verification code.'
    });
    
    console.log("From useRegistrationUser hook: " + userEmail);
    router.push(`/auth/OtpPage?email=${encodeURIComponent(userEmail)}`);
  } else {
    // Email confirmation not required or already confirmed, proceed to login
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Registration successful! You can now log in.'
    });
    
    // Automatically sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (signInError) {
      Toast.show({
        type: 'info',
        text1: 'Registration Complete',
        text2: 'Please log in with your credentials.'
      });
      router.replace('/auth/UserLogin');
    } else {
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Registration and login successful!'
      });
      router.replace('/(tabs)');
    }
  }
};

export default registerUser;
