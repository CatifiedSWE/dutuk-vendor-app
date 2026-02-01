import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const EVENT_CATEGORIES = [
  { id: 'weddings', name: 'Weddings', icon: 'favorite' },
  { id: 'corporate', name: 'Corporate Events', icon: 'apartment' },
  { id: 'concerts', name: 'Concerts', icon: 'music-note' },
  { id: 'parties', name: 'Private Parties', icon: 'celebration' },
  { id: 'decorations', name: 'Decorations', icon: 'auto-awesome' },
  { id: 'conferences', name: 'Conferences', icon: 'podium' },
];

const OnboardingCategories = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleContinue = () => {
    // Navigate to location onboarding step
    // Categories are UI-only for now, will integrate backend later
    router.push('/auth/OnboardingLocation');
  };

  const handleSkip = () => {
    router.push('/auth/OnboardingLocation');
  };

  // Map material icon names to Ionicons equivalents
  const getIconName = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      'favorite': 'heart-outline',
      'apartment': 'business-outline',
      'music-note': 'musical-notes-outline',
      'celebration': 'sparkles-outline',
      'auto-awesome': 'color-wand-outline',
      'podium': 'mic-outline',
    };
    return iconMap[iconName] || 'ellipse-outline';
  };

  return (
    <View style={styles.container}>
      {/* Soft mesh background */}
      <View style={styles.meshBackground} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#1c1917" />
          </Pressable>

          {/* Progress Indicator - Step 2 of 3 */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActiveCurrent]} />
            <View style={styles.progressBar} />
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.stepLabel}>STEP 02</Text>
            <Text style={styles.title}>What type of{'\n'}<Text style={styles.titleItalic}>events</Text> do you conduct?</Text>
            <Text style={styles.subtitle}>
              Select all that apply to personalize your vendor dashboard and management tools.
            </Text>
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {EVENT_CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Pressable
                  key={category.id}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                    pressed && styles.categoryCardPressed
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons 
                      name={getIconName(category.icon) as any} 
                      size={28} 
                      color="#800000" 
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#800000" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.5)" />
          </Pressable>

          <Text style={styles.hintText}>YOU CAN CHANGE THESE LATER IN SETTINGS</Text>
        </View>
      </SafeAreaView>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  meshBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 245, 244, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    width: 24,
    height: 4,
    backgroundColor: '#e7e5e4',
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#800000',
  },
  progressActiveCurrent: {
    width: 40,
    backgroundColor: '#800000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    color: '#1c1917',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  titleItalic: {
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 15,
    color: '#78716c',
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 300,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f5f5f4',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 30,
    elevation: 2,
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: '#800000',
    borderWidth: 2,
  },
  categoryCardPressed: {
    transform: [{ scale: 0.96 }],
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1917',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
  },
  continueButton: {
    height: 60,
    backgroundColor: '#800000',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#a8a29e',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 1,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 6,
    backgroundColor: '#e7e5e4',
    borderRadius: 3,
  },
});

export default OnboardingCategories;
