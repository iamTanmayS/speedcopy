import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../types/cart';

interface CartItemCardProps {
  item: CartItem;
  onEdit?: (item: CartItem) => void;
  showEdit?: boolean;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, onEdit, showEdit = false }) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {showEdit && onEdit && (
        <View style={styles.cartListHeader}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => onEdit(item)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="create-outline" size={14} color="#3b82f6" />
            <Text style={styles.editButtonText}> Edit</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.cartItemCard}>
        <View style={styles.itemImageContainer}>
          <Ionicons name="document-text" size={32} color="#cbd5e1" />
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.product?.title || (item as any).category || 'Unknown Product'}</Text>
          
          {/* Printing Options Display */}
          {(item as any).options ? (
            <Text style={styles.itemOptions}>
              {(item as any).options.colorMode} | {(item as any).options.pageSize} | {(item as any).options.printSide}
            </Text>
          ) : (
            <View>
              <Text style={styles.itemSubtitle}>{item.sku?.title}</Text>
              {item.configSelections && Object.keys(item.configSelections).length > 0 && (
                 <Text style={styles.itemSubtitle}>
                   {Object.entries(item.configSelections).map(([k, v]) => `${v}`).join(' | ')}
                 </Text>
              )}
              {item.customizationNotes ? (
                 <Text style={[styles.itemSubtitle, { fontStyle: 'italic', marginBottom: 6, color: '#475569' }]} numberOfLines={2}>
                    "{item.customizationNotes}"
                 </Text>
              ) : null}
            </View>
          )}

          {/* File Name Display */}
          {((item as any).file || item.uploadedFile) && (
            <View style={styles.fileBox}>
              <Ionicons name="document-attach-outline" size={10} color="#64748b" />
              <Text style={styles.fileText} numberOfLines={1}>{((item as any).file || item.uploadedFile).name}</Text>
            </View>
          )}

          <Text style={styles.itemQuantity}>
            Quantity: {item.quantity < 10 ? `0${item.quantity}` : item.quantity} Units
          </Text>
        </View>

        <View style={styles.itemPriceBox}>
           <Text style={styles.itemPrice}>₹{item.totalPrice || (item as any).price || 0}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartListHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  editButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cartItemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  itemOptions: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 4,
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  fileText: {
    fontSize: 10,
    color: '#64748b',
    flexShrink: 1,
    maxWidth: 150,
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemPriceBox: {
    paddingLeft: 12,
    justifyContent: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  deliveryBadgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  rocketIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  deliveryBadgeTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  deliveryBadgeSub: {
    fontSize: 8,
    color: '#64748b',
  },
});
