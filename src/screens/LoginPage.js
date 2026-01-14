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
import { loadUsers, saveUsers } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.styles';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');

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
      }
    } catch (error) {
      // Auth error handled by Alert
      Alert.alert('Error', 'Authentication failed');
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
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
