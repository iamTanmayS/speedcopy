import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/api/queryClient';
import { useAuthStore } from './src/state_mgmt/store/authStore';

export default function App() {
  const { fetchDevToken } = useAuthStore();

  useEffect(() => {
    // Disabled dev auto-login for testing auth flow
    /*
    if (__DEV__) {
      fetchDevToken();
    }
    */
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