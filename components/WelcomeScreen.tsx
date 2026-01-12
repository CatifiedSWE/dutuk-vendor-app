import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const WelcomeScreen = () => {
  const [loginPressed, setLoginPressed] = React.useState(false);
  const [signupPressed, setSignupPressed] = React.useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Hero Section (45% height) */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXiiQTy-Udnk6uk-3Rs4s5ERD5QOTbDhilzeupSN3BYy-eOgn1Oil9j2NCtVXa-SbmI3nrQMf-0m1JGaMofH7WWdbfCNUMchJgry05B2v7BK5saJkOAh-XcZjfedqbIQgjTZ0-RXmB1ZhQUu5Afeuy5cdrUdswaH9ev-e0gTgU4d5o_Q-fS_emz7sY_LRbKXWAzp3NNg6boF9pMrHSjSJ3AjPsxmJvCaR6VOPhapy7QJIJQrlF7IZ8TydPDp5p04HrKWwmaIOigfXM' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Dark overlay gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.darkOverlay}
          />
          
          {/* Subtle pattern overlay */}
          <View style={styles.patternOverlay} />
          
          {/* White gradient fade to bottom */}
          <LinearGradient
            colors={['transparent', 'transparent', '#FFFFFF']}
            style={styles.whiteGradient}
          />

          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            {/* Icon Circle with frosted effect */}
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={36} color="#FFFFFF" />
            </View>

            {/* DUTUK Title */}
            <Text style={styles.dutukTitle}>DUTUK</Text>

            {/* Vendor Portal Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>VENDOR PORTAL</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom Content Section (55% height) */}
      <View style={styles.contentSection}>
        {/* Soft mesh background gradient */}
        <LinearGradient
          colors={['#FFF5F5', '#FFFBF0', '#FFFFFF', '#FFF5F5']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.meshBackground}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Welcome Heading */}
          <Text style={styles.welcomeHeading}>Welcome</Text>

          {/* Subtitle Text */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitlePrimary}>
              Elevate your event business.
            </Text>
            <Text style={styles.subtitleSecondary}>
              MANAGE • TRACK • SCALE
            </Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          {/* Log In Button */}
          <Pressable
            style={[
              styles.loginButton,
              loginPressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/auth/UserLogin')}
            onPressIn={() => setLoginPressed(true)}
            onPressOut={() => setLoginPressed(false)}
          >
            <Text style={styles.loginText}>Log In</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.5)" style={styles.arrowIcon} />
          </Pressable>

          {/* Sign Up Button */}
          <Pressable
            style={[
              styles.signupButton,
              signupPressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/auth/register')}
            onPressIn={() => setSignupPressed(true)}
            onPressOut={() => setSignupPressed(false)}
          >
            <Text style={styles.signupText}>Sign up</Text>
            <Ionicons name="arrow-forward" size={20} color="#CCCCCC" style={styles.arrowIcon} />
          </Pressable>

          {/* Support Link */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>
              HAVING TROUBLE?{' '}
              <Text style={styles.supportLink}>GET SUPPORT</Text>
            </Text>
          </View>
        </View>

        {/* Bottom Indicator */}
        <View style={styles.bottomIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  heroSection: {
    height: '45%',
    width: '100%',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    opacity: 0.15,
  },
  whiteGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  dutukTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 7.2,
    textAlign: 'center',
  },
  badge: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3,
  },
  contentSection: {
    flex: 1,
    position: 'relative',
  },
  meshBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeHeading: {
    fontSize: 48,
    fontStyle: 'italic',
    color: '#1C1C1C',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitlePrimary: {
    fontSize: 17,
    color: '#57534E',
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 12,
  },
  subtitleSecondary: {
    fontSize: 12,
    color: '#A8A29E',
    fontWeight: '500',
    letterSpacing: 4,
    textAlign: 'center',
    maxWidth: 260,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 64,
    width: '100%',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#800000',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signupText: {
    color: '#292524',
    fontSize: 18,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  supportContainer: {
    paddingTop: 32,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 11,
    color: '#A8A29E',
    fontWeight: '500',
    letterSpacing: 1,
  },
  supportLink: {
    color: '#800000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 6,
    backgroundColor: '#E7E5E4',
    borderRadius: 3,
  },
});

export default WelcomeScreen;