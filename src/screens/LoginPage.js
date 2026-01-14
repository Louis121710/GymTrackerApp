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
  Image,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { loadUsers, saveUsers, resetPassword } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.styles';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const users = await loadUsers();

      if (isLogin) {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          await login(username);
        } else {
          Alert.alert('Error', 'Invalid username or password');
        }
      } else {
        if (users.find(u => u.username === username)) {
          Alert.alert('Error', 'Username already exists');
          return;
        }

        const newUser = {
          username,
          password,
          email: email || '',
          height: '',
          age: '',
          goalWeight: '75',
          goal: 'lose_weight',
          bio: '',
          website: '',
          instagram: '',
          twitter: '',
          profileVisibility: 'public',
          memberSince: Date.now(),
          bodyFat: '',
          chest: '',
          waist: '',
          hips: '',
          biceps: '',
          thighs: ''
        };

        await saveUsers([...users, newUser]);
        await login(username);
        // New users will be automatically redirected to SetupPage by MainTabs
      }
    } catch (error) {
      // Auth error handled by Alert
      Alert.alert('Error', 'Authentication failed');
    }
  };

  const handleResetPassword = async () => {
    if (!resetUsername.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    const result = await resetPassword(resetUsername, resetEmail, newPassword);
    
    if (result.success) {
      Alert.alert('Success', result.message, [
        {
          text: 'OK',
          onPress: () => {
            setShowResetPassword(false);
            setResetUsername('');
            setResetEmail('');
            setNewPassword('');
            setConfirmPassword('');
            setIsLogin(true);
          }
        }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.background}>
        {/* Animated gradient overlay */}
        <LinearGradient
          colors={['rgba(255, 77, 45, 0.12)', 'rgba(255, 107, 53, 0.08)', 'transparent']}
          style={styles.gradientOverlay}
        >
        </LinearGradient>
        
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
              {/* Title with gradient accent */}
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={appStyle.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.titleAccent}
                />
                <Text style={styles.authTitle}>
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </Text>
                <Text style={styles.authSubtitle}>
                  {isLogin ? 'Sign in to continue your journey' : 'Create your account to begin'}
                </Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputsContainer}>
                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <MaterialCommunityIcons name="email-outline" size={20} color={appStyle.colors.accent} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email (optional)"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Forgot Password Link */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => setShowResetPassword(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.authButton} 
                onPress={handleAuth} 
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={appStyle.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.authButtonText}>
                    {isLogin ? 'Login' : 'Sign Up'}
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={appStyle.colors.text} style={styles.buttonIcon} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Switch Mode */}
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(!isLogin)}
                activeOpacity={0.7}
              >
                <Text style={styles.switchText}>
                  {isLogin ? (
                    <>
                      Don't have an account? <Text style={styles.switchTextAccent}>Sign up</Text>
                    </>
                  ) : (
                    <>
                      Already have an account? <Text style={styles.switchTextAccent}>Login</Text>
                    </>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Reset Password Modal */}
        <Modal
          visible={showResetPassword}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowResetPassword(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowResetPassword(false);
                    setResetUsername('');
                    setResetEmail('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color={appStyle.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubtitle}>
                  Enter your username and email (if you provided one) to reset your password.
                </Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={resetUsername}
                    onChangeText={setResetUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email (if you provided one during signup)"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color={appStyle.colors.accent} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={appStyle.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.authButtonText}>Reset Password</Text>
                    <MaterialCommunityIcons name="lock-reset" size={20} color={appStyle.colors.text} style={styles.buttonIcon} />
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
