import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceDetailsCardProps {
  basePrice: number;
  discount: number;
  delivery: number;
  total: number;
}

export const PriceDetailsCard: React.FC<PriceDetailsCardProps> = ({ basePrice, discount, delivery, total }) => {
  return (
    <View style={styles.priceCard}>
      <Text style={styles.priceCardTitle}>Price Details</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Base Price</Text>
        <Text style={styles.priceValue}>₹{basePrice.toFixed(0)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: '#16a34a' }]}>Discount</Text>
        <Text style={[styles.priceValue, { color: '#16a34a' }]}>-₹{discount.toFixed(0)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: '#16a34a' }]}>Delivery charges</Text>
        <Text style={[styles.priceValue, { color: '#16a34a' }]}>
          {delivery === 0 ? 'Free' : `₹${delivery.toFixed(0)}`}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total payable</Text>
        <View style={{ alignItems: 'flex-end' }}>
           <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
           {discount > 0 && <Text style={styles.strikethroughPrice}>₹{basePrice.toFixed(0)}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  priceCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 12,
  },
  priceCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#93c5fd',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  strikethroughPrice: {
    fontSize: 12,
    color: '#64748b',
    textDecorationLine: 'line-through',
    marginTop: -2,
  },
});
