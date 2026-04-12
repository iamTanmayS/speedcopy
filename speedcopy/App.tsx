import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/api/queryClient';
import { useAuthStore } from './src/state_mgmt/store/authStore';
import { initializeNotifications, scheduleMarketingNotifications } from './src/services/NotificationService';

export default function App() {
  const { fetchDevToken } = useAuthStore();

  useEffect(() => {
    // Disabled dev auto-login for testing auth flow
    /*
    if (__DEV__) {
      fetchDevToken();
    }
    */
    
    // Initialize notifications
    const setupNotifications = async () => {
      const isGranted = await initializeNotifications();
      if (isGranted) {
        await scheduleMarketingNotifications();
      }
    };
    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}