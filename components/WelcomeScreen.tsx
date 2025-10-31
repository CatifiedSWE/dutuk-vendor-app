import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import DutukLogo from './DutukLogo';

const { height: screenHeight } = Dimensions.get('window');

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <DutukLogo color="white" width={210} height={59} />
      </View>

      {/* White Card Section */}
      <View style={styles.card}>
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome</Text>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>
          Join the platform powering the next generation of events.
        </Text>

        {/* Login Button */}
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push('/auth/UserLogin')}
        >
          <Text style={styles.loginText}>Log In</Text>
        </Pressable>

        {/* Sign Up Button */}
        <Pressable
          style={styles.signupButton}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.signupText}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  logoSection: {
    position: 'absolute',
    top: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    height: 59,
  },
  logoText: {
    fontSize: 47,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  card: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    top: 245,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 27,
    paddingTop: 162,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 21,
    fontWeight: '300',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
    lineHeight: 26,
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
  loginText: {
    fontSize: 21,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signupButton: {
    width: '100%',
    height: 46,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 21,
    fontWeight: '300',
    color: '#000000',
    textAlign: 'center',
  },
});

export default WelcomeScreen;