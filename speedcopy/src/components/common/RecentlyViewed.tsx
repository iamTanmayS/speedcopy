import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProductCard } from './ProductCard';
import { useTheme } from '../../../theme';
import { PrintProduct } from '../../types/product';

interface RecentlyViewedProps {
  products: PrintProduct[];
  onProductPress?: (productId: string) => void;
  onLikePress?: (productId: string) => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
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
          Recently Viewed
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {products.map(item => (
          <ProductCard
            key={item.id}
            product={item}
            onPress={() => onProductPress?.(item.id)}
            onLikePress={() => onLikePress?.(item.id)}
          />
        ))}
      </ScrollView>
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
  horizontalScroll: {
    paddingBottom: 24,
    gap: 10,
  },
});
