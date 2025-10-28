import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginPage from '../screens/LoginPage';
import HomePage from '../screens/HomePage';
import AddRecordPage from '../screens/AddRecordPage';
import RecordListPage from '../screens/RecordListPage';
import ChartPage from '../screens/ChartPage';
import ProfilePage from '../screens/ProfilePage';
import appStyle from '../../appStyle';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appStyle.colors.background }}>
        <Text style={{ color: appStyle.colors.text }}>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering MainTabs - User:', user);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AddRecord') {
            iconName = 'plus-box';
          } else if (route.name === 'Records') {
            iconName = 'format-list-bulleted';
          } else if (route.name === 'Charts') {
            iconName = 'chart-line';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          } else if (route.name === 'Login') {
            iconName = 'login';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: appStyle.colors.primary,
        tabBarInactiveTintColor: appStyle.colors.text,
        tabBarStyle: {
          backgroundColor: appStyle.colors.background,
          borderTopColor: '#363636',
          display: user ? 'flex' : 'none',
        },
        headerShown: false,
      })}
    >
      {user ? (
        // Authenticated user tabs
        <>
          <Tab.Screen name="Home" component={HomePage} />
          <Tab.Screen name="AddRecord" component={AddRecordPage} />
          <Tab.Screen name="Records" component={RecordListPage} />
          <Tab.Screen name="Charts" component={ChartPage} />
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