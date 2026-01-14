/**
 * Setup Page - Onboarding form for new users
 * 
 * Collects essential profile information before users can access the app.
 * Required fields: Height, Age, Goal Weight, and Fitness Goal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { getCurrentUser, updateUserProfile } from '../utils/storage';
import { useUserProfile } from '../context/UserProfileContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import styles from './SetupPage.styles';

const SetupPage = () => {
  const navigation = useNavigation();
  const { refreshProfile } = useUserProfile();
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [goal, setGoal] = useState('lose_weight');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goals = [
    { value: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
    { value: 'gain_muscle', label: 'Gain Muscle', icon: 'trending-up' },
    { value: 'maintenance', label: 'Maintain Weight', icon: 'trending-neutral' },
  ];

  const handleCompleteSetup = async () => {
    // Validate required fields
    if (!height.trim() || !age.trim() || !goalWeight.trim()) {
      Alert.alert('Required Fields', 'Please fill in all required fields (Height, Age, and Goal Weight)');
      return;
    }

    // Validate numeric values
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);
    const goalWeightNum = parseFloat(goalWeight);

    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      Alert.alert('Invalid Input', 'Please enter a valid height in cm (1-300)');
      return;
    }

    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      Alert.alert('Invalid Input', 'Please enter a valid age (1-150)');
      return;
    }

    if (isNaN(goalWeightNum) || goalWeightNum <= 0 || goalWeightNum > 500) {
      Alert.alert('Invalid Input', 'Please enter a valid goal weight in kg (1-500)');
      return;
    }

    setIsSubmitting(true);

    try {
      const username = await getCurrentUser();
      if (!username) {
        Alert.alert('Error', 'You must be logged in to complete setup');
        return;
      }

      // Update user profile with the provided information
      await updateUserProfile(username, {
        height: height.trim(),
        age: age.trim(),
        goalWeight: goalWeight.trim(),
        goal: goal,
      });

      // Refresh profile context
      await refreshProfile();

      Alert.alert(
        'Setup Complete!',
        'Your profile has been set up successfully. You can now start using the app!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              // The navigation will automatically redirect to Home once profile is complete
              // Force a navigation reset to trigger the profile check
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.background}>
        {/* Gradient overlay */}
        <LinearGradient
          colors={['rgba(255, 77, 45, 0.12)', 'rgba(255, 107, 53, 0.08)', 'transparent']}
          style={styles.gradientOverlay}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={appStyle.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.titleAccent}
                />
                <Text style={styles.setupTitle}>Complete Your Profile</Text>
                <Text style={styles.setupSubtitle}>
                  Help us personalize your fitness journey
                </Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputsContainer}>
                {/* Height */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="ruler" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Height (cm) *"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                </View>

                {/* Age */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="cake" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Age *"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                </View>

                {/* Goal Weight */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="flag" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Goal Weight (kg) *"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={goalWeight}
                    onChangeText={setGoalWeight}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                </View>

                {/* Fitness Goal */}
                <View style={styles.goalSection}>
                  <Text style={styles.goalLabel}>Fitness Goal *</Text>
                  <View style={styles.goalButtonsContainer}>
                    {goals.map((goalOption) => (
                      <TouchableOpacity
                        key={goalOption.value}
                        style={[
                          styles.goalButton,
                          goal === goalOption.value && styles.goalButtonActive
                        ]}
                        onPress={() => setGoal(goalOption.value)}
                        activeOpacity={0.7}
                      >
                        {goal === goalOption.value ? (
                          <LinearGradient
                            colors={appStyle.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.goalButtonGradient}
                          >
                            <MaterialCommunityIcons
                              name={goalOption.icon}
                              size={20}
                              color="#FFFFFF"
                            />
                            <Text style={styles.goalButtonTextActive}>
                              {goalOption.label}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.goalButtonInactive}>
                            <MaterialCommunityIcons
                              name={goalOption.icon}
                              size={20}
                              color={appStyle.colors.textSecondary}
                            />
                            <Text style={styles.goalButtonText}>
                              {goalOption.label}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Complete Setup Button */}
              <TouchableOpacity
                style={[styles.completeButton, isSubmitting && styles.completeButtonDisabled]}
                onPress={handleCompleteSetup}
                activeOpacity={0.9}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={appStyle.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.completeButtonText}>
                    {isSubmitting ? 'Saving...' : 'Complete Setup'}
                  </Text>
                  {!isSubmitting && (
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color={appStyle.colors.text}
                      style={styles.buttonIcon}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.requiredNote}>
                * Required fields
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SetupPage;
