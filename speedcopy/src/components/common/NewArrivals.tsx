import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import { useTheme } from '../../../theme';
import { PrintProduct } from '../../types/product';

interface NewArrivalsProps {
  products: PrintProduct[];
  onProductPress?: (productId: string) => void;
  onLikePress?: (productId: string) => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onProductPress,
  onLikePress,
}) => {
  const { theme } = useTheme();

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.fg.default }]}>
          New Arrivals
        </Text>
      </View>
      <View style={styles.gridContainer}>
        {products.map(item => (
          <ProductCard
            key={item.id}
            product={item}
            onPress={() => onProductPress?.(item.id)}
            onLikePress={() => onLikePress?.(item.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeader: { 
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold',
  },
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
});
