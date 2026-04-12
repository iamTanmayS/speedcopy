import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MainTabParamList } from './types';
import { HomeStack } from './HomeStack';
import { ProfileStack } from './ProfileStack';
import { ModeSwitchScreen } from '../screens/home/ModeSwitchScreen';
import { WishlistScreen } from '../screens/home/WishlistScreen';
import { CartScreen } from '../screens/checkout/CartScreen';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { useCatalogQuery } from '../api/catalog.api';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
    // Top-level, passive fetch to warm up and keep the Zustand catalogStore synchronized.
    useCatalogQuery();

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={ModeSwitchScreen} 
                options={{ tabBarLabel: 'Switch' }} 
            />
            <Tab.Screen 
                name="MainActionTab" 
                component={HomeStack} 
                options={({ route }) => ({
                    tabBarLabel: 'Main',
                    tabBarStyle: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
                        const hideOn = ['AddressList', 'AddNewAddress', 'TrackOrder', 'Editor', 'Upload', 'GiftCustomize', 'PreviewLock', 'Payment', 'Checkout'];
                        if (hideOn.includes(routeName)) {
                            return { display: 'none' };
                        }
                        return undefined;
                    })(route) as any
                })}
            />
            <Tab.Screen 
                name="CartTab" 
                component={CartScreen} 
                options={{ 
                    tabBarLabel: 'Cart',
                    tabBarStyle: { display: 'none' } 
                }} 
            />
            <Tab.Screen 
                name="WishlistTab" 
                component={WishlistScreen} 
                options={{ tabBarLabel: 'Wishlist' }} 
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileStack} 
                options={{ 
                    tabBarLabel: 'Profile',
                    tabBarStyle: { display: 'none' } 
                }} 
            />
        </Tab.Navigator>
    );
};
