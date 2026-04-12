import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingPricingFooterProps {
  basePrice: number;
  discountAmount: number;
  totalPayable: number;
  onAddToCart: () => void;
  buttonText?: string;
  savingsText?: string;
}

export const FloatingPricingFooter: React.FC<FloatingPricingFooterProps> = ({
  basePrice,
  discountAmount,
  totalPayable,
  onAddToCart,
  buttonText = "Add to Cart",
  savingsText
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingFooter, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Base Price</Text>
          <Text style={styles.priceValue}>₹{basePrice}</Text>
        </View>

        {discountAmount > 0 && (
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.discountLabel}>Discount</Text>
              {savingsText && (
                <Text style={styles.savingsLabel}>{savingsText}</Text>
              )}
            </View>
            <Text style={styles.discountValue}>-₹{discountAmount}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total payable</Text>
          <Text style={styles.totalValue}>₹{totalPayable}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.cartButton} 
        onPress={onAddToCart} 
        activeOpacity={0.8}
      >
        <Text style={styles.cartButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: '#4b5563',
  },
  priceValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  discountLabel: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 2,
  },
  savingsLabel: {
    fontSize: 9,
    color: '#16a34a',
  },
  discountValue: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#bfdbfe',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  cartButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
