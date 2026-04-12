import { Alert } from 'react-native';

/**
 * Push notifications via expo-notifications have been temporarily safely stubbed 
 * out because Expo Go on Android completely dropped support for the underlying 
 * push modules in SDK 53+, causing an inescapable hard crash on boot.
 * 
 * To fully implement Zomato/Swiggy style push loops, a native Development Build (EAS Build)
 * must be compiled. 
 */

export async function initializeNotifications() {
  console.log('Push notifications initialized (Stub Mode for Expo Go compatibility)');
  return true;
}

export async function sendInstantNotification(title: string, body: string, data?: Record<string, any>) {
  // Graceful fallback for dev debugging without crashing
  console.log(`[PUSH NOTIFICATION TRIGGERED]: ${title} - ${body}`);
  
  // We can show a simple in-app alert for now just to confirm it works
  Alert.alert(title, body);
}

export async function scheduleMarketingNotifications() {
  console.log('[PUSH NOTIFICATION SCHEDULED]: Marketing loops active (Stub Mode).');
}
