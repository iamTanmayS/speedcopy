import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/home/SearchScreen';
import { CategoryListingScreen } from '../screens/catalog/CategoryListingScreen';
import { ProductListScreen } from '../screens/catalog/ProductListScreen';
import { ProductDetailScreen } from '../screens/catalog/ProductDetailScreen';
import { ShoppingProductDetailScreen } from '../screens/catalog/ShoppingProductDetailScreen';
import { GiftProductDetailScreen } from '../screens/catalog/GiftProductDetailScreen';
import { SubCategorySelectScreen } from '../screens/catalog/SubCategorySelectScreen';
import { UploadScreen } from '../screens/editor/UploadScreen';
import { GiftCustomizeScreen } from '../screens/editor/GiftCustomizeScreen';
import { EditorScreen } from '../screens/editor/EditorScreen';
import { PreviewLockScreen } from '../screens/editor/PreviewLockScreen';
import { CartScreen } from '../screens/checkout/CartScreen';
import { AddressListScreen } from '../screens/checkout/AddressListScreen';
import { DeliveryModeScreen } from '../screens/checkout/DeliveryModeScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { PaymentScreen } from '../screens/checkout/PaymentScreen';
import { AddNewAddressScreen } from '../screens/checkout/AddNewAddressScreen';
import { TrackOrderScreen } from '../screens/orders/TrackOrderScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="CategoryListing" component={CategoryListingScreen} />
      <Stack.Screen name="SubCategorySelect" component={SubCategorySelectScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="GiftProductDetail" component={GiftProductDetailScreen} />
      <Stack.Screen name="ShoppingProductDetail" component={ShoppingProductDetailScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="GiftCustomize" component={GiftCustomizeScreen} />
      <Stack.Screen name="Editor" component={EditorScreen} />
      <Stack.Screen name="PreviewLock" component={PreviewLockScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="AddressList" component={AddressListScreen} />
      <Stack.Screen name="AddNewAddress" component={AddNewAddressScreen} />
      <Stack.Screen name="DeliveryMode" component={DeliveryModeScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
    </Stack.Navigator>
  );
};
