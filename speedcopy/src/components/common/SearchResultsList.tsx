import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types/catalog';
import { useWishlistQuery, useToggleWishlistMutation } from '../../api/wishlist.api';

interface SearchResultsListProps {
  searchQuery: string;
  sourceProducts: Product[];
  onProductPress: (productId: string) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  searchQuery,
  sourceProducts,
  onProductPress,
}) => {
  const { data: wishlist } = useWishlistQuery();
  const toggleWishlist = useToggleWishlistMutation();

  const handleToggleWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return sourceProducts.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(lowerQuery);
      const descMatch = (p.description || '').toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch;
    });
  }, [searchQuery, sourceProducts]);

  if (!searchQuery.trim()) return null;

  if (filteredProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products found matching "{searchQuery}"</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Search Results ({filteredProducts.length})</Text>
      <View style={styles.grid}>
        {filteredProducts.map(p => {
          const isFavorite = !!wishlist?.find(w => w.id === p.id);
          const cardShape = {
            id: p.id,
            title: p.title,
            description: p.description ?? '',
            basePrice: p.startingPrice || 60,
            currency: '₹',
            imageUrl: p.thumbnailUrl ?? `https://picsum.photos/seed/${p.slug}/300/200`,
            isFavorite,
          };

          return (
            <View key={p.id} style={styles.gridItem}>
              <ProductCard
                product={cardShape as any}
                onPress={() => onProductPress(p.id)}
                onLikePress={() => handleToggleWishlist(p.id)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0f172a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
