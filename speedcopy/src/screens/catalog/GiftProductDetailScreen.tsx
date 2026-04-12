import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { FavoriteButton } from '../../components/common/FavoriteButton';
import { DesignOptionsModal } from '../../components/common/DesignOptionsModal';
import { ProductImageCarousel } from '../../components/common/ProductImageCarousel';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { useProductDetailQuery } from '../../api/catalog.api';

// Delivery badge data
const DELIVERY_BADGES = [
  { icon: 'car-outline', label: 'Free Delivery' },
  { icon: 'refresh-outline', label: '7 Day Return' },
  { icon: 'shield-checkmark-outline', label: 'Secure Payment' },
];

const FEATURES = [
  'High-quality ceramic material',
  'Dishwasher and microwave safe',
  'Vibrant, long-lasting print',
  'Comfortable C-handle grip',
];

const OFFERS = [
  'Get 10% cash back on payment via UPI.',
  'Free shipping on orders above ₹500.',
  'Use code GIFT10 for an extra 10% off on gifting.',
];

export const GiftProductDetailScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { productId } = route.params || {};
  const { addToCart } = useCartStore();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'features' | 'offers'>('features');
  const [showDesignModal, setShowDesignModal] = useState(false);

  const { data, isLoading, isError } = useProductDetailQuery(productId);

  if (isLoading || !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: 'red' }}>Failed to load product.</Text>
      </View>
    );
  }

  const product = data.product;
  const activeSku = data.skus[0];
  const price = activeSku?.sellingPrice ?? product.startingPrice ?? 0;
  const mrp = activeSku?.mrp ?? Math.round(price * 1.3);
  const discountPercent = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const carouselImages = [
    { uri: `https://picsum.photos/seed/${product.slug}/500/500`, key: 'main' },
    { uri: `https://picsum.photos/seed/${product.slug}1/500/500`, key: 'alt1' },
    { uri: `https://picsum.photos/seed/${product.slug}2/500/500`, key: 'alt2' },
  ];

  const quickDesigns = [
    `https://picsum.photos/seed/${product.slug}d1/200/150`,
    `https://picsum.photos/seed/${product.slug}d2/200/150`,
    `https://picsum.photos/seed/${product.slug}d3/200/150`,
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.title} on SpeedCopy! Starting at ₹${price}.`,
      });
    } catch {}
  };

  const handleAddToCart = () => {
    if (!activeSku) return;
    addToCart({
      id: Math.random().toString(36).substr(2),
      cartId: 'c1',
      productId: product.id,
      product: product as any,
      skuId: activeSku.id,
      sku: activeSku as any,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      deliveryMode: 'standard' as any,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    navigation.navigate('Cart');
  };

  const handleCustomize = () => {
    const mode = product.customizationMode;
    if (mode === 'none') {
      // No customization needed — add directly and navigate if buy now
      addToCart({
        id: Math.random().toString(36).substr(2),
        cartId: 'c1',
        productId: product.id,
        product: product as any,
        skuId: activeSku?.id ?? '',
        sku: activeSku as any,
        quantity: qty,
        unitPrice: price,
        totalPrice: price * qty,
        deliveryMode: 'standard' as any,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      navigation.navigate('Cart');
    } else if (mode === 'upload_only') {
      navigation.navigate('GiftCustomize', {
        productId: product.id,
        productTitle: product.title,
        skuId: activeSku?.id ?? '',
        skuTitle: activeSku?.title ?? '',
        qty,
        configSelections: {},
        unitPrice: price,
        totalPrice: price * qty,
        uploadOnly: true,
      });
    } else if (mode === 'editor_only') {
      navigation.navigate('Editor', { fileId: 'new' });
    } else {
      // upload_or_editor — show the design options modal
      setShowDesignModal(true);
    }
  };

  const hasCustomization = product.customizationMode !== 'none';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScreenWrapper
        backgroundColor="#f8fafc"
        fixedHeader={
          <Header
            title="Product Details"
            rightElement={
              <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={22} color="#0f172a" />
              </TouchableOpacity>
            }
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Image carousel ── */}
        <ProductImageCarousel
          images={carouselImages}
          accentColor="#e91e8c"
          height={280}
          topRightElement={
            <FavoriteButton
              productId={product.id}
              iconSize={22}
              withContainer
            />
          }
        />

        {/* ── Info section ── */}
        <View style={styles.infoContainer}>
          {/* Title + price */}
          <Text style={styles.productTitle}>{product.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{price}</Text>
            {mrp > price && (
              <Text style={styles.oldPrice}>₹{mrp}</Text>
            )}
            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercent}% OFF</Text>
              </View>
            )}
          </View>
          <Text style={styles.taxNote}>Inclusive of all taxes</Text>

          {/* Description */}
          <Text style={styles.sectionHeading}>Product Description</Text>
          <Text style={styles.description}>
            {product.description ?? 'A beautiful item perfect for your needs.'}
          </Text>

          {/* Qty + Customize */}
          <View style={styles.qtyRow}>
            <View style={styles.qtyBlock}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(q => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty < 10 ? `0${qty}` : qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(q => q + 1)}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {hasCustomization && (
              <TouchableOpacity
                style={styles.customizeBtn}
                onPress={() => handleCustomize()}
              >
                <Text style={styles.customizeBtnText}>Customize</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CTAs */}
          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={() => handleCustomize()}
            activeOpacity={0.85}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          {/* Delivery badges */}
          <View style={styles.badgesRow}>
            {DELIVERY_BADGES.map(b => (
              <View key={b.label} style={styles.badgeItem}>
                <View style={styles.badgeIconWrap}>
                  <Ionicons name={b.icon as any} size={22} color="#0f172a" />
                </View>
                <Text style={styles.badgeText}>{b.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Design gallery */}
          <Text style={styles.sectionHeading}>Select Quick Design</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {quickDesigns.map((uri, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleCustomize()}
                style={styles.quickDesignCard}
              >
                <Image source={{ uri }} style={styles.quickDesignImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Features / Offers tabs */}
          <View style={styles.tabRow}>
            {(['features', 'offers'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'features' ? (
              <View>
                <Text style={styles.tabHeading}>Product Features</Text>
                {FEATURES.map(f => (
                  <View key={f} style={styles.bulletRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.bulletText}>{f}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <Text style={styles.tabHeading}>Available Offers</Text>
                {OFFERS.map(o => (
                  <View key={o} style={styles.bulletRow}>
                    <Ionicons name="pricetag-outline" size={14} color="#f59e0b" />
                    <Text style={styles.bulletText}>{o}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScreenWrapper>

      {/* Design Options Modal */}
      <DesignOptionsModal
        visible={showDesignModal}
        onClose={() => setShowDesignModal(false)}
        onSelectUpload={() => {
          setShowDesignModal(false);
          navigation.navigate('GiftCustomize', {
            productId: product.id,
            productTitle: product.title,
            skuId: activeSku?.id ?? '',
            skuTitle: activeSku?.title ?? '',
            qty,
            configSelections: {},
            unitPrice: price,
            totalPrice: price * qty,
            uploadOnly: true,
          });
        }}
        onSelectEditor={() => {
          setShowDesignModal(false);
          navigation.navigate('Editor', { fileId: 'new' });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  shareBtn: { padding: 8 },

  // Hero
  heroContainer: { padding: 16, paddingBottom: 0, position: 'relative' },
  heroImage: {
    width: '100%', height: 280, borderRadius: 20,
    backgroundColor: '#e2e8f0', resizeMode: 'cover',
  },
  heartBtn: { position: 'absolute', top: 24, right: 24 },

  // Thumbnails
  thumbnailRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 4,
  },
  thumbnailBox: {
    width: 60, height: 60, borderRadius: 12, overflow: 'hidden',
    borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#f1f5f9',
  },
  thumbnailBoxActive: { borderColor: '#e91e8c', borderWidth: 2.5 },
  thumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Info
  infoContainer: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff',
    borderRadius: 24, padding: 20, paddingBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  productTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  currentPrice: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  oldPrice: { fontSize: 14, color: '#94a3b8', textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  taxNote: { fontSize: 11, color: '#94a3b8', marginBottom: 20 },

  sectionHeading: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  description: { fontSize: 13, color: '#64748b', lineHeight: 20, marginBottom: 20 },

  // Qty + Customize
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  qtyBlock: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center',
  },
  qtyValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', minWidth: 28, textAlign: 'center' },
  customizeBtn: {
    borderWidth: 1.5, borderColor: '#0f172a', borderRadius: 30,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  customizeBtnText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },

  // CTAs
  buyNowBtn: {
    backgroundColor: '#0f172a', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  addToCartBtn: {
    borderWidth: 1.5, borderColor: '#0f172a', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 24,
  },
  addToCartText: { color: '#0f172a', fontSize: 16, fontWeight: '700' },

  // Delivery badges
  badgesRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28,
    backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
  },
  badgeItem: { alignItems: 'center', flex: 1 },
  badgeIconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#0f172a', textAlign: 'center' },

  // Quick designs
  quickDesignCard: { marginRight: 12, borderRadius: 14, overflow: 'hidden' },
  quickDesignImage: { width: 140, height: 100, backgroundColor: '#e2e8f0', borderRadius: 14 },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 30, backgroundColor: '#f1f5f9' },
  tabActive: { backgroundColor: '#0f172a' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  tabContent: {
    backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
  },
  tabHeading: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  bulletText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 },
});
