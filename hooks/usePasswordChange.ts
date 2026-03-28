import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { Alert } from "react-native";
import { validatePassword } from "./authHelpers";

const usePasswordChange = async (password: string) => {
  const validation = validatePassword(password);
  if (!validation.valid) {
    Alert.alert("Invalid Password", validation.message);
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    logger.error(error);
    Alert.alert("Error", "Failed to change password. Please try again.");
  } else {
    Alert.alert("Password changed!");
    router.replace("/(tabs)/home");
  }
};

export default usePasswordChange;
