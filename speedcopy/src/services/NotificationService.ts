import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Initializes notifications by requesting permissions.
 * Call this as early as possible in the app lifecycle (e.g. in App.tsx layout)
 */
export async function initializeNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  return true;
}

/**
 * Send an immediate local notification (e.g., Added to Cart, Order Placed)
 */
export async function sendInstantNotification(title: string, body: string, data?: Record<string, any>) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: null, // Send immediately
  });
}

/**
 * Schedule recurring Zomato/Swiggy style notifications
 * Every 3 hours (10800 seconds)
 */
const MARKETING_MESSAGES = [
  { title: '📝 Hungry for prints?', body: 'Order your documents now and get lightning fast delivery!' },
  { title: '🎁 Someone\'s special day coming up?', body: 'Check out our custom gifts section for amazing ideas.' },
  { title: '✨ Your ideas brought to life!', body: 'Whether it\'s a mug or a business card, we print it all.' },
  { title: '📑 Still waiting?', body: 'Upload your documents directly from your phone and we\'ll deliver the hard copies.' },
];

export async function scheduleMarketingNotifications() {
  // Clear any previously scheduled notifications to avoid duplicates over time
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Best practice for recurring local notifications in Expo without backend: 
  // Schedule a few in advance with varying times.
  let delayHours = 3; 

  for (let i = 0; i < MARKETING_MESSAGES.length; i++) {
    const msg = MARKETING_MESSAGES[i];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayHours * 3600, // hours to seconds
        repeats: false 
      },
    });
    
    // Increment delay for the next message
    delayHours += 3;
  }
}
