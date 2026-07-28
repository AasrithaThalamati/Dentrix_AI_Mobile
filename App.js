import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Disable native screens optimization on Web to avoid display:none blank screen bug
if (Platform.OS === 'web') {
  enableScreens(false);
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.id = 'expo-web-reset';
    style.textContent = `
      html, body, #root, #root > div {
        height: 100vh !important;
        width: 100vw !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow-x: hidden !important;
        background-color: #ffffff !important;
      }
    `;
    if (!document.getElementById('expo-web-reset')) {
      document.head.appendChild(style);
    }
  }
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
