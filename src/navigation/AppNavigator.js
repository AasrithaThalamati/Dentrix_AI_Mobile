import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { DrawerProvider } from '../context/DrawerContext';
import SideDrawer from '../components/SideDrawer';
import SplashScreen from '../components/SplashScreen';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AnalyzeScreen from '../screens/AnalyzeScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ResearchScreen from '../screens/ResearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, label }) {
  const iconName = focused ? name : `${name}-outline`;
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons name={iconName} size={22} color={focused ? '#2563eb' : '#6b6760'} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// 3-Tab Bottom Navigator: Home, Analyse, Profile
function MainTabNavigator() {
  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="AnalyzeTab"
        component={AnalyzeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="sparkles" focused={focused} label="Analyse" />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Wrapper with Side Drawer Support
function MainStackWrapper({ navigation }) {
  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }} detachInactiveScreens={false}>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Patients" component={PatientsScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Research" component={ResearchScreen} />
        </Stack.Navigator>
        <SideDrawer navigation={navigation} />
      </View>
    </DrawerProvider>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show opening logo animation for 1.8 seconds after scanning/launching
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator detachInactiveScreens={false} screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainStackWrapper} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8e6e1',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  tabLabel: {
    fontSize: 11,
    color: '#6b6760',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
});
