import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginPage from '../screens/LoginPage';
import HomePage from '../screens/HomePage';
import AddRecordPage from '../screens/AddRecordPage';
import RecordListPage from '../screens/RecordListPage';
import StatsPage from '../screens/StatsPage';
import ProfilePage from '../screens/ProfilePage';
import CustomWorkoutPage from '../screens/CustomWorkoutPage';
import appStyle from '../../appStyle';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appStyle.colors.background }}>
        <Text style={{ color: appStyle.colors.text }}>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering MainTabs - User:', user);

  // Calculate safe bottom padding for navigation bar
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AddRecord') {
            iconName = 'plus-box';
          } else if (route.name === 'CustomWorkout') {
            iconName = 'dumbbell';
          } else if (route.name === 'Records') {
            iconName = 'format-list-bulleted';
          } else if (route.name === 'Stats') {
            iconName = 'chart-line';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          } else if (route.name === 'Login') {
            iconName = 'login';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: appStyle.colors.accent,
        tabBarInactiveTintColor: appStyle.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: appStyle.colors.surface,
          borderTopColor: appStyle.colors.cardBorder,
          borderTopWidth: 1,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          display: user ? 'flex' : 'none',
        },
        headerShown: false,
      })}
    >
      {user ? (
        // Authenticated user tabs
        <>
          <Tab.Screen name="Home" component={HomePage} />
          <Tab.Screen 
            name="AddRecord" 
            component={AddRecordPage}
            options={{ tabBarLabel: 'Records' }}
          />
          <Tab.Screen 
            name="CustomWorkout" 
            component={CustomWorkoutPage}
            options={{ tabBarLabel: 'Workouts' }}
          />
          <Tab.Screen name="Records" component={RecordListPage} />
          <Tab.Screen name="Stats" component={StatsPage} />
          <Tab.Screen name="Profile" component={ProfilePage} />
        </>
      ) : (
        // Not authenticated - only show login
        <Tab.Screen name="Login" component={LoginPage} />
      )}
    </Tab.Navigator>
  );
};

export default MainTabs;