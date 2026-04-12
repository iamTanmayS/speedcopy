import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
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
  basePrice: p.startingPrice || 60,
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

export const ShoppingHomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, subCategories, products } = useCatalogStore();
  const { data: wishlist } = useWishlistQuery();
  const toggleWishlist = useToggleWishlistMutation();

  const stationeryCategory = useMemo(
    () => categories.find(c => c.name.toLowerCase() === 'shopping' || c.name.toLowerCase() === 'stationery'),
    [categories],
  );

  const stationerySubCategories = useMemo(() => {
    if (!stationeryCategory) return [];
    return subCategories.filter(
      sc => sc.categoryId === stationeryCategory.id && sc.isActive,
    );
  }, [subCategories, stationeryCategory]);

  const stationeryProducts = useMemo(() => {
    if (!stationeryCategory) return [];
    const subCatIds = stationerySubCategories.map(sc => sc.id);
    return products.filter(
      p => subCatIds.includes(p.subCategoryId) && p.isActive,
    );
  }, [products, stationeryCategory, stationerySubCategories]);

  const recentProducts = useMemo(() => stationeryProducts.slice(0, 4).map(p => ({
    ...toCardShape(p),
    isFavorite: !!wishlist?.find(w => w.id === p.id)
  })), [stationeryProducts, wishlist]);
  
  const newArrivalProducts = useMemo(() => stationeryProducts.slice(4).map(p => ({
    ...toCardShape(p),
    isFavorite: !!wishlist?.find(w => w.id === p.id)
  })), [stationeryProducts, wishlist]);

  const handleProductPress = (productId: string) =>
    navigation.navigate('ShoppingProductDetail', { productId });

  const handleToggleWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  return (
    <ScreenWrapper
      fixedHeader={
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>
            Shopping
          </Text>
        </View>
      }
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <Text style={{ color: '#94a3b8', marginLeft: 8, fontSize: 13 }}>Search</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerContainer}>
         {/* Using generic blue gradient styled similarly to mockup */}
         <View style={[styles.banner, { backgroundColor: '#1e81b0' }]}>
           <Text style={styles.bannerLight}>Free Shipping</Text>
           <Text style={styles.bannerSmall}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
           <TouchableOpacity style={styles.bannerBtn}>
             <Text style={styles.bannerBtnText}>Shop Now</Text>
           </TouchableOpacity>
         </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <TouchableOpacity style={styles.categoryBadge} onPress={() => {}}>
           <View style={[styles.categoryIconBox, { backgroundColor: '#e2e8f0' }]} />
           <Text style={styles.categoryName}>All</Text>
        </TouchableOpacity>
        
        {stationerySubCategories.map((sc, idx) => (
          <TouchableOpacity
            key={sc.id}
            style={styles.categoryBadge}
            onPress={() =>
              navigation.navigate('ProductList', {
                categoryId: stationeryCategory?.id ?? '',
                subCategoryId: sc.id,
              })
            }
          >
            <Image 
               source={{ uri: `https://picsum.photos/seed/${sc.id}/300/300` }}
               style={styles.categoryIconBox}
            />
            <Text style={styles.categoryName} numberOfLines={2}>
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, height: 44,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#000', justifyContent: 'center', alignItems: 'center',
  },
  bannerContainer: { marginBottom: 24 },
  banner: {
    width: '100%', height: 160, borderRadius: 16, padding: 20,
    justifyContent: 'center', overflow: 'hidden',
  },
  bannerLight: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  bannerSmall: { color: '#fff', fontSize: 10, marginTop: 4, width: '60%', lineHeight: 14 },
  bannerBtn: {
    backgroundColor: '#38bdf8', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'flex-start', marginTop: 12,
  },
  bannerBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  categoryScroll: { paddingRight: 16, marginBottom: 24, gap: 16 },
  categoryBadge: { alignItems: 'center', width: 85 },
  categoryIconBox: { width: 85, height: 85, borderRadius: 24, marginBottom: 8, backgroundColor: '#f1f5f9' },
  categoryName: { fontSize: 12, textAlign: 'center', fontWeight: '800', lineHeight: 16, color: '#0f172a' },
});
