import AuthOTP from "@/components/AuthOTP";
import getUserEmail from "@/hooks/useGetUserEmail";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";

const ChangePasswordOtpPage = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const userEmail: any = await getUserEmail();
      setEmail(userEmail);
    };

    fetchEmail();
  }, []);

  // useEffect(() => {
  //   if (email != null) {
  //     console.log("Call from changePasswordOTP", email);
  //     sendOTP(email);
  //   }
  // }, [email]);

  if (!email) {
    return <Text>Loading...</Text>;
  }

  return (
    <AuthOTP
      email={email}
      cell_count={6}
      route={"/profilePages/profileSettings/changePassword"}
      title="Verify your email before you change password"
      subtitle="Enter the 6 digit code sent to your email"
      initOTP={true}
    />
  );
};

export default ChangePasswordOtpPage;
