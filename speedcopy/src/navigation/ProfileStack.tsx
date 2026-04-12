import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileOverviewScreen } from '../screens/profile/ProfileOverviewScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { DataExportScreen } from '../screens/profile/DataExportScreen';
import { WalletScreen } from '../screens/profile/WalletScreen';
import { ReferralsScreen } from '../screens/profile/ReferralsScreen';
import { SupportTicketScreen } from '../screens/profile/SupportTicketScreen';
import { OrderListScreen } from '../screens/orders/OrderListScreen';
import { TrackOrderScreen } from '../screens/orders/TrackOrderScreen';
import { AddressListScreen } from '../screens/checkout/AddressListScreen';
import { AddNewAddressScreen } from '../screens/checkout/AddNewAddressScreen';
import { FAQScreen } from '../screens/profile/FAQScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileOverview" component={ProfileOverviewScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="DataExport" component={DataExportScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Referrals" component={ReferralsScreen} />
      <Stack.Screen name="SupportTicket" component={SupportTicketScreen} />
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      <Stack.Screen name="AddressList" component={AddressListScreen} />
      <Stack.Screen name="AddNewAddress" component={AddNewAddressScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
    </Stack.Navigator>
  );
};
