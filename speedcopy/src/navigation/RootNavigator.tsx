import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import { useAuthStore } from '../state_mgmt/store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Check for profile completeness: either explicit flag or sanity check on name/phone
  const isProfileComplete = user?.profileComplete || 
    Boolean(user?.name && user.name.trim() !== 'User' && user?.name.trim() !== '' && user?.phone && user.phone.trim() !== '');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !isProfileComplete ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};
