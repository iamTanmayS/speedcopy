import React from 'react';
import { useAppStore } from '../../state_mgmt/store/appStore';
import { PrintHomeScreen } from './PrintHomeScreen';
import { GiftHomeScreen } from './GiftHomeScreen';
import { ShoppingHomeScreen } from './ShoppingHomeScreen';

export const HomeScreen = ({ navigation, route }: any) => {
  const { mode } = useAppStore();

  switch(mode) {
    case 'print':
      return <PrintHomeScreen navigation={navigation} route={route} />;
    case 'gift':
      return <GiftHomeScreen navigation={navigation} route={route} />;
    case 'shopping':
      return <ShoppingHomeScreen navigation={navigation} route={route} />;
    default:
      return <PrintHomeScreen navigation={navigation} route={route} />;
  }
};
