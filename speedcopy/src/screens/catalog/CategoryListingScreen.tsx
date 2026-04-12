import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { useCatalogQuery } from '../../api/catalog.api';
import type { Category } from '../../types/catalog';

export const CategoryListingScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { data, isLoading, isError } = useCatalogQuery();

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('ProductList', { categoryId: category.id });
  };

  const getCategoryConfig = (name: string) => {
    switch (name.toLowerCase()) {
      case 'printing':
        return { icon: 'print-outline' as const, bg: '#dbeafe', color: '#2563eb', desc: 'Documents, banners, flyers & more' };
      case 'gifts':
        return { icon: 'gift-outline' as const, bg: '#fce7f3', color: '#db2777', desc: 'Mugs, cushions, corporate gifts' };
      case 'stationery':
        return { icon: 'pencil-outline' as const, bg: '#fef3c7', color: '#d97706', desc: 'Pens, diaries, office supplies' };
      default:
        return { icon: 'layers-outline' as const, bg: '#f3f4f6', color: '#4b5563', desc: 'Various items' };
    }
  };

  return (
    <ScreenWrapper
      backgroundColor={theme.colors.bg.default}
      fixedHeader={<Header title="Categories" />}
    >
      <View style={styles.content}>
        <Text style={[styles.pageTitle, { color: theme.colors.fg.default }]}>
          What do you need today?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.fg.muted }]}>
          Select a category to view products.
        </Text>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent.default} />
          </View>
        ) : isError || !data ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: theme.colors.status.error }}>Failed to load categories.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {data.categories.filter(c => c.isActive).length === 0 ? (
               <View style={styles.centerContainer}>
                  <Text style={[styles.subtitle, { color: theme.colors.fg.muted, textAlign: 'center' }]}>
                    No categories are available at the moment.
                  </Text>
               </View>
            ) : (
              data.categories.filter(c => c.isActive).map((category) => {
                const config = getCategoryConfig(category.name);
                return (
                  <TouchableOpacity 
                    key={category.id}
                    style={[styles.listItem, { backgroundColor: theme.colors.bg.default }]}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                      <Ionicons name={config.icon} size={24} color={config.color} />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text style={[styles.itemTitle, { color: theme.colors.fg.default }]}>
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </Text>
                      <Text style={[styles.itemSubtitle, { color: theme.colors.fg.muted }]}>
                        {config.desc}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.fg.muted} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  centerContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     minHeight: 200
  },
  listContainer: {
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
  },
});
