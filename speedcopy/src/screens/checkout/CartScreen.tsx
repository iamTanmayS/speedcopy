import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { useBuilderStore } from '../../state_mgmt/store/builderStore';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { CartItemCard } from '../../components/common/CartItemCard';
import { PriceDetailsCard } from '../../components/common/PriceDetailsCard';

export const CartScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cart, getTotalPrice, removeFromCart } = useCartStore();
  const { setCategory, setBindingType, setOptions } = useBuilderStore();

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, [navigation]);

  const subtotal = Number(getTotalPrice() || 0);
  const discount = 0; // Item-level discounts already applied in UploadScreen
  const delivery = 0; // Free delivery logic
  const total = subtotal + delivery;

  const handleEditJob = (job: any) => {
    removeFromCart(job.id);
    setCategory(job.category);
    setBindingType(job.bindingType);
    setOptions(job.options);
    navigation.navigate('MainActionTab', { screen: 'CategoryListing' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScreenWrapper
        backgroundColor="#f8fafc"
        fixedHeader={<Header title="Cart" />}
        contentContainerStyle={{ paddingBottom: 180 }}
        showFooter={false}
        withBottomNavPadding={false}
      >
        <View style={styles.content}>
          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Your cart is empty.</Text>
            </View>
          ) : (
            cart.map((item) => (
               <CartItemCard 
                 key={item.id} 
                 item={item}   
                 showEdit={true} 
                 onEdit={handleEditJob} 
               />
            ))
          )}
        </View>
      </ScreenWrapper>

      {cart.length > 0 && (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <PriceDetailsCard 
             basePrice={subtotal} 
             discount={discount} 
             delivery={delivery} 
             total={total} 
          />

          <Text style={styles.secureText}>100% Secure Payment</Text>

          <TouchableOpacity 
            style={styles.payButton} 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('MainActionTab', { screen: 'Checkout' })}
          >
            <Text style={styles.payButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#f8fafc',
  },
  secureText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
