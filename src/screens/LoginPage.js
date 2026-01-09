import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import appStyle from '../../appStyle';
import { loadUsers, saveUsers } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

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
        // Login logic
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          await login(username); // Use context login
          console.log('Login successful');
        } else {
          Alert.alert('Error', 'Invalid username or password');
        }
      } else {
        // Register logic
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
        await login(username); // Use context login
        console.log('Registration successful');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Authentication failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={appStyle.gradients.primary}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="dumbbell" size={80} color={appStyle.colors.primary} />
            <Text style={styles.title}>Gym Tracker</Text>
            <Text style={styles.subtitle}>Track your fitness journey</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.authTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Email (optional)"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <View style={styles.demoSection}>
                <Text style={styles.demoText}>Demo Account:</Text>
                <Text style={styles.demoText}>Username: demo</Text>
                <Text style={styles.demoText}>Password: demo123</Text>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => {
                    setUsername('demo');
                    setPassword('demo123');
                  }}
                >
                  <Text style={styles.demoButtonText}>Use Demo Credentials</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    color: appStyle.colors.text,
    fontSize: 36,
    fontFamily: appStyle.fonts.bold.fontFamily,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    color: appStyle.colors.accent,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  form: {
    backgroundColor: appStyle.colors.cardBackground,
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
    ...appStyle.shadows.large,
  },
  authTitle: {
    color: appStyle.colors.text,
    fontSize: 24,
    fontFamily: appStyle.fonts.bold.fontFamily,
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: appStyle.colors.surfaceElevated,
    color: appStyle.colors.text,
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: appStyle.fonts.regular.fontFamily,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  authButton: {
    backgroundColor: appStyle.colors.accent,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    ...appStyle.shadows.medium,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: appStyle.fonts.bold.fontFamily,
  },
  switchButton: {
    alignItems: 'center',
    padding: 10,
  },
  switchText: {
    color: appStyle.colors.accent,
    fontSize: 14,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
  demoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: appStyle.colors.surfaceElevated,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: appStyle.colors.accent,
    borderWidth: 1,
    borderColor: appStyle.colors.cardBorder,
  },
  demoText: {
    color: appStyle.colors.text,
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
    marginBottom: 2,
  },
  demoButton: {
    backgroundColor: appStyle.colors.primary,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: appStyle.fonts.regular.fontFamily,
  },
});

export default LoginPage;