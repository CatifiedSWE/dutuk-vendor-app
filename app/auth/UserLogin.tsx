import googleLogin from "@/hooks/useGoogleAuth";
import loginUser from "@/hooks/useLoginUser";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import Toast from 'react-native-toast-message';

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', email.trim().toLowerCase());
      await loginUser(email.trim().toLowerCase(), password.trim());
    } catch (error) {
      console.error('Login error in component:', error);
      // Error handling is done in the loginUser hook
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await googleLogin();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Google authentication failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email first'
      });
      return;
    }

    try {
      const { supabase } = await import('@/utils/supabase');
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send verification email'
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Verification email sent! Check your inbox.'
        });
        router.push(`/auth/OtpPage?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send verification email'
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
          {/* Header */}
          <Text style={styles.headerText}>Log In</Text>
          <Text style={styles.subHeaderText}>Welcome back to your account</Text>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Sample Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Log In'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Auth Button */}
          <Pressable
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleAuth}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>Google Auth</Text>
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New User? </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text style={styles.signupLink}>Sign Up here</Text>
            </Pressable>
          </View>

          {/* Verification Link */}
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>Need to verify your email? </Text>
            <Pressable onPress={handleResendVerification}>
              <Text style={styles.verificationLink}>Resend verification</Text>
            </Pressable>
          </View>
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
    width: 402,
    height: 904,
    backgroundColor: '#FFFFFF',
    borderRadius: 25.2,
    paddingHorizontal: 30,
    paddingTop: "40%",
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4.8 },
    shadowOpacity: 0.1,
    shadowRadius: 22.68,
    elevation: 10,
    marginTop: 0,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 50,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 17.8268,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 10.28,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.21382,
    borderColor: '#363636',
    borderRadius: 9.7106,
    paddingHorizontal: 15.42,
    fontSize: 15.4227,
    color: '#353535',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 21.2389,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    fontSize: 15.5648,
    fontWeight: '500',
    color: '#363636',
    marginHorizontal: 16,
  },
  googleButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  googleButtonText: {
    fontSize: 21.2389,
    fontWeight: '300',
    color: '#000000',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 18.1853,
    fontWeight: '300',
    color: '#000000',
  },
  signupLink: {
    fontSize: 18.1853,
    fontWeight: '300',
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  verificationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#666666',
  },
  verificationLink: {
    fontSize: 14,
    fontWeight: '400',
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default UserLogin;