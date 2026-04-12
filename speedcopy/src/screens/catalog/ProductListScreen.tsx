import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { ProductCard } from '../../components/common/ProductCard';
import { useCatalogQuery } from '../../api/catalog.api';
import { getProductRouteParams } from '../../utils/productNavigation';

export const ProductListScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { categoryId, subCategoryId } = route.params || {};

  const { data, isLoading, isError } = useCatalogQuery();

  const activeCategory = useMemo(() => {
    return data?.categories.find(c => c.id === categoryId);
  }, [data, categoryId]);

  const products = useMemo(() => {
    if (!data || !categoryId) return [];

    let relevantSubCats = data.subCategories.filter(sc => sc.categoryId === categoryId && sc.isActive);
    if (subCategoryId) {
      relevantSubCats = relevantSubCats.filter(sc => sc.id === subCategoryId);
    }

    const subCatIds = relevantSubCats.map(sc => sc.id);
    return data.products.filter(p => subCatIds.includes(p.subCategoryId) && p.isActive);
  }, [data, categoryId, subCategoryId]);

  const handleProductPress = (product: any) => {
    if (!data) return;
    const routeParams = getProductRouteParams(product, data);
    if (routeParams) {
        navigation.navigate(routeParams.screen, routeParams.params);
    }
  };

  const getHeaderTheme = (name: string = '') => {
    switch (name.toLowerCase()) {
      case 'printing':
        return { bg: '#EFF6FF', text: '#1E3A8A' };
      case 'gifts':
        return { bg: '#FDF2F8', text: '#831843' };
      case 'shopping':
      case 'stationery':
        return { bg: '#FFFBEB', text: '#78350F' };
      default:
        return { bg: '#F8FAFC', text: '#0F172A' };
    }
  };

  const headerTheme = getHeaderTheme(activeCategory?.name);

  return (
    <ScreenWrapper
      backgroundColor="#f8fafc"
      scrollable={false}
      fixedHeader={
        <Header 
          title={activeCategory ? (activeCategory.name.charAt(0).toUpperCase() + activeCategory.name.slice(1)) : 'Products'} 
        />
      }
    >
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {/* Banner Section */}
        {activeCategory && (
            <View style={[styles.banner, { backgroundColor: headerTheme.bg }]}>
                <Text style={[styles.bannerTitle, { color: headerTheme.text }]}>
                    {activeCategory.name.charAt(0).toUpperCase() + activeCategory.name.slice(1)}
                </Text>
                <Text style={styles.bannerSubtitle}>
                    {products.length} product{products.length !== 1 ? 's' : ''} available
                </Text>
            </View>
        )}

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent.default} />
          </View>
        ) : isError || !data ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: theme.colors.status.error }}>Failed to load products.</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No products found in this category.</Text>
          </View>
        ) : (
          <FlatList
             data={products}
             keyExtractor={(item) => item.id}
             numColumns={2}
             contentContainerStyle={styles.listContent}
             columnWrapperStyle={styles.row}
             showsVerticalScrollIndicator={false}
             renderItem={({ item }) => (
                <ProductCard
                    product={{
                        id: item.id,
                        title: item.title,
                        basePrice: item.startingPrice ?? 0,
                        currency: '₹',
                        imageUrl: item.thumbnailUrl ? item.thumbnailUrl : `https://picsum.photos/seed/${item.slug}/300/200`,
                        isTrending: false, // Could compute this if we wanted
                    }}
                    onPress={() => handleProductPress(item)}
                />
             )}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  emptyText: { color: '#64748b', fontSize: 15 },
  banner: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  bannerTitle: {
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 4,
  },
  bannerSubtitle: {
      fontSize: 13,
      color: '#64748b',
      fontWeight: '500'
  }
});
