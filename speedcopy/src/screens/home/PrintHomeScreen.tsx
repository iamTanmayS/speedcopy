import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, ScrollView,
} from 'react-native';
import { useTheme } from '../../../theme';
import { SearchArea } from '../../components/common/SearchArea';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { PromoBanner } from '../../components/common/PromoBanner';
import { RecentlyViewed } from '../../components/common/RecentlyViewed';
import { NewArrivals } from '../../components/common/NewArrivals';
import { useCatalogStore } from '../../state_mgmt/store/catalogStore';
import { useWishlistQuery, useToggleWishlistMutation } from '../../api/wishlist.api';
import type { Product } from '../../types/catalog';

const { width } = Dimensions.get('window');

export const PrintHomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const { categories, subCategories, products } = useCatalogStore();
  const { data: wishlist } = useWishlistQuery();
  const toggleWishlist = useToggleWishlistMutation();

  /** Map a real API Product to the shape ProductCard / RecentlyViewed / NewArrivals expect */
  const toCardShape = useCallback((p: Product) => {
    const isFavorite = !!wishlist?.find(w => w.id === p.id);
    return {
      id: p.id,
      title: p.title,
      description: p.description ?? '',
      basePrice: p.startingPrice || 0,
      currency: '₹',
      imageUrl: p.thumbnailUrl ?? `https://picsum.photos/seed/${p.slug}/300/200`,
      categoryId: 'all' as any,
      isNewArrival: false,
      isTrending: false,
      isFavorite,
      isRecentlyViewed: false,
      printOptionsConfig: { paperSizes: [], paperTypes: [], colorOptions: [] },
      deliveryPackages: [],
    };
  }, [wishlist]);

  // ── Get the "printing" category ──────────────────────────────────────────
  const printingCategory = useMemo(
    () => categories.find(c => c.name.toLowerCase() === 'printing'),
    [categories],
  );

  // ── Get all printing subcategories (for the category icon rail) ────────────
  const printSubCategories = useMemo(() => {
    if (!printingCategory) return [];
    return subCategories
      .filter(sc => sc.categoryId === printingCategory.id && sc.isActive);
  }, [subCategories, printingCategory]);

  // ── All products in the printing category ────────────────────────────────
  const printingProducts = useMemo(() => {
    if (!printingCategory) return [];
    const printSubCatIds = subCategories
      .filter(sc => sc.categoryId === printingCategory.id)
      .map(sc => sc.id);
    return products.filter(
      p => printSubCatIds.includes(p.subCategoryId) && p.isActive,
    );
  }, [products, subCategories, printingCategory]);

  // For RecentlyViewed take first 4, NewArrivals take rest (or all if < 4)
  const recentProducts = useMemo(() => printingProducts.slice(0, 4).map(toCardShape), [printingProducts, toCardShape]);
  const newArrivalProducts = useMemo(() => printingProducts.slice(4).map(toCardShape), [printingProducts, toCardShape]);

  // ── Subcategory icon images for the horizontal rail ──────────────────────
  const getSubCatIconUrl = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('standard') || t.includes('document')) return 'https://cdn-icons-png.flaticon.com/512/300/300222.png';
    if (t.includes('business')) return 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png';
    if (t.includes('market')) return 'https://cdn-icons-png.flaticon.com/512/1261/1261163.png';
    if (t.includes('photo')) return 'https://cdn-icons-png.flaticon.com/512/1829/1829586.png';
    return 'https://cdn-icons-png.flaticon.com/512/747/747990.png';
  };

  // ── When a product card is tapped ────────────────────────────────────────
  const handleProductPress = (productId: string) => {
    const product = printingProducts.find(p => p.id === productId);
    if (!product) return;
    navigation.navigate('SubCategorySelect', {
      categoryId: printingCategory?.id ?? '',
      productId: product.id,
      customizationMode: product.customizationMode,
    });
  };

  const handleToggleWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  return (
    <ScreenWrapper
      fixedHeader={
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>
            Print Store
          </Text>
        </View>
      }
      contentContainerStyle={styles.scrollContent}
    >
        <View style={styles.searchRow}>
          <SearchArea
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            onFilterPress={() => console.log('Filter Pressed')}
          />
        </View>

        <PromoBanner
          title="Free Delivery"
          subtitle="On"
          subtitleHighlight="Print Products"
          description={"Shop for business cards,\ncalendars, flyers & more!"}
          imageUri="https://images.unsplash.com/vector-1739804042073-17243bad520f?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          backgroundColor="#2563eb"
          style={{ marginBottom: 24 }}
        />

        {/* Horizontal subcategory rail — shows printing subcategories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {printSubCategories.map(sc => (
            <TouchableOpacity
              key={sc.id}
              style={styles.categoryBadge}
              onPress={() =>
                navigation.navigate('ProductList', {
                  categoryId: printingCategory?.id ?? '',
                  subCategoryId: sc.id,
                })
              }
            >
              <View style={[styles.categoryIconBox, { backgroundColor: theme.colors.bg.muted }]}>
                <Image source={{ uri: getSubCatIconUrl(sc.title) }} style={styles.categoryImage} />
              </View>
              <Text style={[styles.categoryName, { color: theme.colors.fg.default }]} numberOfLines={2}>
                {sc.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products — same sections as before, now real data */}
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
  categoryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 14 },
});
