import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView,
} from 'react-native';
import { useTheme } from '../../../theme';
import { SearchArea } from '../../components/common/SearchArea';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { PromoBanner } from '../../components/common/PromoBanner';
import { SearchResultsList } from '../../components/common/SearchResultsList';
import { RecentlyViewed } from '../../components/common/RecentlyViewed';
import { NewArrivals } from '../../components/common/NewArrivals';
import { useCatalogStore } from '../../state_mgmt/store/catalogStore';
import { useWishlistQuery, useToggleWishlistMutation } from '../../api/wishlist.api';
import type { Product } from '../../types/catalog';

const { width } = Dimensions.get('window');

const toCardShape = (p: Product) => ({
  id: p.id,
  title: p.title,
  description: p.description ?? '',
  basePrice: 0,
  currency: '₹',
  imageUrl: p.thumbnailUrl ?? `https://picsum.photos/seed/${p.slug}/300/200`,
  categoryId: 'all' as any,
  isNewArrival: false,
  isTrending: false,
  isFavorite: false,
  isRecentlyViewed: false,
  printOptionsConfig: { paperSizes: [], paperTypes: [], colorOptions: [] },
  deliveryPackages: [],
});

export const GiftHomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, subCategories, products } = useCatalogStore();
  const { data: wishlist } = useWishlistQuery();
  const toggleWishlist = useToggleWishlistMutation();

  const giftsCategory = useMemo(
    () => categories.find(c => c.name.toLowerCase() === 'gifts'),
    [categories],
  );

  const giftSubCategories = useMemo(() => {
    if (!giftsCategory) return [];
    return subCategories.filter(
      sc => sc.categoryId === giftsCategory.id && sc.isActive,
    );
  }, [subCategories, giftsCategory]);

  const giftProducts = useMemo(() => {
    if (!giftsCategory) return [];
    const subCatIds = giftSubCategories.map(sc => sc.id);
    return products.filter(
      p => subCatIds.includes(p.subCategoryId) && p.isActive,
    );
  }, [products, giftsCategory, giftSubCategories]);

  const recentProducts = useMemo(() => giftProducts.slice(0, 4).map(p => ({
    ...toCardShape(p),
    isFavorite: !!wishlist?.find(w => w.id === p.id)
  })), [giftProducts, wishlist]);
  
  const newArrivalProducts = useMemo(() => giftProducts.slice(4).map(p => ({
    ...toCardShape(p),
    isFavorite: !!wishlist?.find(w => w.id === p.id)
  })), [giftProducts, wishlist]);

  const handleProductPress = (productId: string) =>
    navigation.navigate('GiftProductDetail', { productId });

  const handleToggleWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  return (
    <ScreenWrapper
      fixedHeader={
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>
            Gift Store
          </Text>
        </View>
      }
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.searchRow}>
        <SearchArea
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search gifts"
          onFilterPress={() => console.log('Filter Pressed')}
        />
      </View>

      {searchQuery.trim().length > 0 ? (
        <SearchResultsList
          searchQuery={searchQuery}
          sourceProducts={giftProducts}
          onProductPress={handleProductPress}
        />
      ) : (
        <>
          <PromoBanner
            title="Premium Gifts"
            subtitle="For"
            subtitleHighlight="Every Occasion"
            description={"Mugs, cushions, frames\n& personalized gifts!"}
            imageUri="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2070&auto=format&fit=crop"
            backgroundColor="#ff7aa2"
            style={{ marginBottom: 24 }}
          />

          {/* Subcategory icon rail */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {giftSubCategories.map(sc => (
              <TouchableOpacity
                key={sc.id}
                style={styles.categoryBadge}
                onPress={() =>
                  navigation.navigate('ProductList', {
                    categoryId: giftsCategory?.id ?? '',
                    subCategoryId: sc.id,
                  })
                }
              >
                <View style={[styles.categoryIconBox, { backgroundColor: theme.colors.bg.muted }]}>
                  <Text style={{ fontSize: 28 }}>🎁</Text>
                </View>
                <Text style={[styles.categoryName, { color: theme.colors.fg.default }]} numberOfLines={2}>
                  {sc.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <RecentlyViewed
            products={recentProducts as any}
            onProductPress={handleProductPress}
            onLikePress={handleToggleWishlist}
          />

          <NewArrivals
            products={newArrivalProducts as any}
            onProductPress={handleProductPress}
            onLikePress={handleToggleWishlist}
          />
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
  searchRow: { marginBottom: 20 },
  categoryScroll: { paddingRight: 16, marginBottom: 24 },
  categoryBadge: { alignItems: 'center', marginRight: 16, width: 65 },
  categoryIconBox: { width: 65, height: 65, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 14 },
});
