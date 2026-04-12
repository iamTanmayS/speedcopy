import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI Payments', subLabel: 'Google Pay, Phone Pay, Paytm', icon: 'apps-outline' },
  { id: 'wallet', label: 'SpeedCopy Wallet', subLabel: 'Available Balance: ₹100', icon: 'wallet-outline' },
  { id: 'razorpay', label: 'Razorpay / Cards', subLabel: 'Credit, Debit, NetBanking', icon: 'card-outline' },
];

export const PaymentScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { selectedPaymentMethod, setSelectedPaymentMethod, getTotalPrice } = useCartStore();

  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedPaymentMethod?.id || null);

  const handleSave = () => {
    if (localSelectedId) {
      const method = PAYMENT_METHODS.find(m => m.id === localSelectedId);
      if (method) setSelectedPaymentMethod({ id: method.id, label: method.label, subLabel: method.subLabel });
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScreenWrapper
        backgroundColor="#f5f5f5"
        fixedHeader={<Header title="Payment Method" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showFooter={false}
        withBottomNavPadding={false}
      >
        <View style={styles.content}>
          <View style={styles.amountBox}>
             <Text style={styles.amountLabel}>Amount to Pay</Text>
             <Text style={styles.amountValue}>₹{getTotalPrice().toFixed(2)}</Text>
          </View>

          <Text style={styles.sectionHeading}>Select Payment Option</Text>

          {PAYMENT_METHODS.map((method) => {
            const isSelected = localSelectedId === method.id;
            return (
              <TouchableOpacity 
                key={method.id}
                style={[styles.paymentCard, isSelected && styles.selectedPaymentCard]} 
                activeOpacity={0.8}
                onPress={() => setLocalSelectedId(method.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.paymentIconBox, isSelected && { backgroundColor: '#0f172a' }]}>
                    <Ionicons name={method.icon as any} size={20} color={isSelected ? "#fff" : "#334155"} />
                  </View>
                  <View style={{ flex: 1, paddingLeft: 12 }}>
                     <Text style={[styles.paymentTitle, isSelected && { color: '#0f172a' }]}>{method.label}</Text>
                     {method.subLabel && (
                        <Text style={styles.paymentSubTitle}>{method.subLabel}</Text>
                     )}
                  </View>
                </View>
                <View style={[styles.radioOutline, isSelected && { borderColor: '#000' }]}>
                   {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScreenWrapper>

      {/* Sticky Save Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Payment Option</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  amountBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1', 
  },
  selectedPaymentCard: {
    borderColor: '#0f172a',
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748b',
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
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
