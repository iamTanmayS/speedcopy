import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { DesignOptionsModal } from '../../components/common/DesignOptionsModal';
import { useCatalogQuery } from '../../api/catalog.api';
import type { SubCategory } from '../../types/catalog';

// Colour palette for subcategory cards
const PALETTE = [
  { bg: '#dbeafe', accent: '#2563eb' },
  { bg: '#fce7f3', accent: '#db2777' },
  { bg: '#fef3c7', accent: '#d97706' },
  { bg: '#e0e7ff', accent: '#4f46e5' },
  { bg: '#dcfce7', accent: '#16a34a' },
  { bg: '#fee2e2', accent: '#dc2626' },
];

const SUBCATEGORY_ICONS: Record<string, string> = {
  'standard': 'document-text-outline',
  'business': 'briefcase-outline',
  'marketing': 'megaphone-outline',
  'invitations': 'mail-outline',
  'photo': 'image-outline',
  'mugs':  'cafe-outline',
  'frames': 'image-outline',
  'cushions': 'bed-outline',
  'stationery': 'pencil-outline',
  'notebooks': 'book-outline',
};

const getIcon = (title: string): string => {
  const lower = title.toLowerCase();
  for (const key of Object.keys(SUBCATEGORY_ICONS)) {
    if (lower.includes(key)) return SUBCATEGORY_ICONS[key];
  }
  return 'layers-outline';
};

export const SubCategorySelectScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { categoryId, productId, customizationMode } = route.params || {};
  const [isDesignModalVisible, setIsDesignModalVisible] = React.useState(false);


  const handleSubCategorySelect = () => {
    switch (customizationMode) {
      case 'upload_only':
        navigation.navigate('Upload', { productId });
        break;
      case 'editor_only':
        navigation.navigate('Editor', { fileId: 'new' });
        break;
      case 'upload_or_editor':
        setIsDesignModalVisible(true);
        break;
      default:
        // none or unknown — go straight to product detail / cart
        navigation.navigate('ProductDetail', { productId });
    }
  };

  const { data, isLoading, isError } = useCatalogQuery();

  const parentCategory = useMemo(() => {
    return data?.categories.find(c => c.id === categoryId);
  }, [data, categoryId]);

  const subCategories: SubCategory[] = useMemo(() => {
    if (!data || !categoryId) return [];
    // Only show "Document Printing" and "Business Printing"
    return data.subCategories.filter(sc => 
      sc.categoryId === categoryId && 
      sc.isActive &&
      (sc.title.toLowerCase().includes('document') || sc.title.toLowerCase().includes('business'))
    );
  }, [data, categoryId]);

  const title = 'Select Printing Type';

  return (
    <ScreenWrapper
      backgroundColor={theme.colors.bg.default}
      fixedHeader={<Header title={title} />}
    >
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={[styles.pageTitle, { color: theme.colors.fg.default }]}>
          Select Printing Type
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.fg.muted }]}>
          Choose a category for your document.
        </Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.accent.default} />
          </View>
        ) : isError || !data ? (
          <View style={styles.center}>
            <Text style={{ color: theme.colors.status.error }}>
              Failed to load categories.
            </Text>
          </View>
        ) : subCategories.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="layers-outline" size={48} color={theme.colors.fg.muted} />
            <Text style={[styles.emptyText, { color: theme.colors.fg.muted }]}>
              No subcategories found.
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {subCategories.map((sc, index) => {
              const palette = PALETTE[index % PALETTE.length];
              const icon = getIcon(sc.title) as any;
              const productCount = data.products.filter(
                p => p.subCategoryId === sc.id && p.isActive
              ).length;

              return (
                <TouchableOpacity
                  key={sc.id}
                  style={[styles.card, { backgroundColor: theme.colors.bg.default }]}
                  activeOpacity={0.8}
                  onPress={handleSubCategorySelect}
                >
                  <View style={[styles.iconBox, { backgroundColor: palette.bg }]}>
                    <Ionicons name={icon} size={26} color={palette.accent} />
                  </View>
                  <View style={styles.textBox}>
                    <Text style={[styles.cardTitle, { color: theme.colors.fg.default }]}>
                      {sc.title}
                    </Text>
                    <Text style={[styles.cardSub, { color: theme.colors.fg.muted }]}>
                      Cards, flyers &amp; marketing
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.fg.muted} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <DesignOptionsModal
        visible={isDesignModalVisible}
        onClose={() => setIsDesignModalVisible(false)}
        onSelectUpload={() => {
          setIsDesignModalVisible(false);
          navigation.navigate('Upload', { productId });
        }}
        onSelectEditor={() => {
          setIsDesignModalVisible(false);
          navigation.navigate('Editor', { fileId: 'new' });
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 250,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 12,
  },
});
