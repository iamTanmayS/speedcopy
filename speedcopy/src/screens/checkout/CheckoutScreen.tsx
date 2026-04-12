import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { CartItemCard } from '../../components/common/CartItemCard';
import { PriceDetailsCard } from '../../components/common/PriceDetailsCard';
import { useCreateOrderMutation } from '../../api/order.api';
import { sendInstantNotification } from '../../services/NotificationService';

export const CheckoutScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { cart, getTotalPrice, selectedAddress, selectedPaymentMethod, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrderMutation();

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

  const handlePaySecurely = async () => {
    if (!selectedAddress) {
      Alert.alert('Selection Required', 'Please select a delivery address to proceed.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Add something to print!');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          skuId: item.skuId,
          productName: item.product?.title || (item as any).title || (item as any).category,
          skuName: item.sku?.title || (item as any).skuTitle || (item as any).skuName,
          quantity: item.quantity,
          fileId: item.fileId,
          unitPrice: item.unitPrice || (item as any).price || 0,
          totalPrice: item.totalPrice,
          deliveryMode: 'next_day'
        })),
        deliveryAddress: selectedAddress,
        subtotal,
        deliveryFee: delivery,
        discountAmount: discount,
        totalAmount: total,
      };

      const result = await createOrderMutation.mutateAsync(orderData);
      
      if (result.success) {
        // Payment is mocked - in production, this would charge via payment gateway
        sendInstantNotification('Order Placed Successfully! 🎉', 'Your order has been placed and is being processed.');
        clearCart();
        navigation.replace('TrackOrder', { orderId: result.data.id });
      } else {
        Alert.alert('Order Error', result.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      Alert.alert(
        'Order Failed',
        err.response?.status === 401
          ? 'Session expired. Please restart the app and try again.'
          : 'Could not place your order. Please check your connection and try again.'
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScreenWrapper
        backgroundColor="#f8fafc"
        fixedHeader={<Header title="Payment & Summary" />}
        contentContainerStyle={{ paddingBottom: 280 }}
        showFooter={false}
        withBottomNavPadding={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionHeading}>Order Summary</Text>
          <Text style={styles.sectionSubheading}>Review your order before Payment</Text>
          
          {cart.map((item) => (
            <CartItemCard 
               key={item.id} 
               item={item}   
               showEdit={false} 
            />
          ))}

          <TouchableOpacity 
            style={styles.addressCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddressList')}
          >
            <View style={styles.addressHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={18} color="#0f172a" />
                <Text style={styles.addressTitle}> Delivery To</Text>
              </View>
              <View style={styles.addressTag}>
                <Text style={styles.addressTagText}>{selectedAddress?.label || 'Select'}</Text>
              </View>
            </View>
            <Text style={styles.addressText}>{selectedAddress?.address || 'Please select a delivery address.'}</Text>
            {selectedAddress?.pinCode && <Text style={styles.addressText}>Pin: {selectedAddress.pinCode}</Text>}
          </TouchableOpacity>

          <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Payment Method</Text>

          <TouchableOpacity 
            style={styles.paymentCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Payment')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={styles.paymentIconBox}>
                <Ionicons name="wallet-outline" size={20} color="#0f172a" />
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                 <Text style={styles.paymentTitle}>{selectedPaymentMethod?.label || 'Select Payment Method'}</Text>
                 {selectedPaymentMethod?.subLabel && (
                    <Text style={styles.paymentSubTitle}>{selectedPaymentMethod.subLabel}</Text>
                 )}
              </View>
            </View>
            <View style={styles.radioOutline}>
               <View style={styles.radioInner} />
            </View>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>

      {/* Floating Footer Placed Outside the ScrollView */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PriceDetailsCard 
           basePrice={subtotal} 
           discount={discount} 
           delivery={delivery} 
           total={total} 
        />
        <Text style={styles.secureText}>100% Secure Payment</Text>
        <TouchableOpacity 
            style={[styles.payButton, createOrderMutation.isPending && { opacity: 0.7 }]} 
            activeOpacity={0.8}
            onPress={handlePaySecurely}
            disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? (
              <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay Securely</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  addressTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addressTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  addressText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0', 
  },
  paymentIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#cbd5e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  paymentSubTitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  radioOutline: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#0f172a',
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
