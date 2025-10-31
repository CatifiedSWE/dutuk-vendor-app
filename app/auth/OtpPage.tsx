import { supabase } from "@/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import Toast from 'react-native-toast-message';

const OtpPage = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(59);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = `otp-${index + 1}`;
      // Focus next input (you'd need refs for this in a real implementation)
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter complete OTP'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: otpCode,
        type: 'email'
      });

      if (error) {
        console.log('OTP verification error:', error);
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: error.message
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Email verified successfully!'
        });
        
        // Import setRole function
        try {
          const setRole = (await import('@/hooks/setVendorAsRoleOnRegister')).default;
          await setRole();
        } catch (roleError) {
          console.log('Role setting error:', roleError);
        }
        
        router.replace('/(tabs)');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email as string,
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to resend code'
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'New code sent!'
        });
        setCountdown(59);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend code'
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.headerText}>Enter OTP</Text>
        <Text style={styles.subHeaderText}>
          We have sent you an otp to {email} for verification
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              editable={!loading}
            />
          ))}
        </View>

        {/* Verify Button */}
        <Pressable
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </Pressable>

        {/* Resend Code */}
        <Pressable onPress={handleResendCode} disabled={countdown > 0}>
          <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0 ? `Resend code in ${countdown} secs` : 'Resend code'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 407,
    height: 933,
    backgroundColor: '#FFFFFF',
    borderRadius: 25.2,
    paddingHorizontal: 30,
    paddingTop: 280,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4.8 },
    shadowOpacity: 0.1,
    shadowRadius: 22.68,
    elevation: 10,
    marginLeft: -5,
    marginTop: -23,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subHeaderText: {
    fontSize: 18.5493,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
    paddingHorizontal: 3,
  },
  otpInput: {
    width: 47.39,
    height: 47.39,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 7,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  verifyButtonText: {
    fontSize: 21.2389,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  resendText: {
    fontSize: 18.087,
    fontWeight: '300',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
  resendDisabled: {
    color: '#999999',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default OtpPage;