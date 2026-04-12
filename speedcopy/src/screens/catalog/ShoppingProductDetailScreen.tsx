import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Share,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { FileUploadDropzone } from '../../components/common/FileUploadDropzone';
import { FavoriteButton } from '../../components/common/FavoriteButton';
import { ProductImageCarousel } from '../../components/common/ProductImageCarousel';
import { DesignOptionsModal } from '../../components/common/DesignOptionsModal';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { useProductDetailQuery } from '../../api/catalog.api';
import { API_BASE_URL } from '../../config/env';

// ── Static content ──────────────────────────────────────────────
const DELIVERY_BADGES = [
  { icon: 'car-outline', label: 'Free Delivery' },
  { icon: 'refresh-outline', label: '7 Day Return' },
  { icon: 'shield-checkmark-outline', label: 'Secure Payment' },
];

const FEATURES = [
  'High-quality material',
  'Acid-free Paper',
  'Vibrant, long lasting',
  'Smooth touch feel',
];

const OFFERS = [
  'Get 10% cash back on payment via UPI.',
  'Free shipping on orders above ₹500.',
  'Extra 5% off using code SHOP5.',
];

// ────────────────────────────────────────────────────────────────
export const ShoppingProductDetailScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { productId } = route.params || {};
  const { addToCart } = useCartStore();

  const { data, isLoading, isError } = useProductDetailQuery(productId);

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'features' | 'offers'>('features');
  const [file, setFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);

  // ── Guards ──
  if (isLoading || !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f59e0b" />
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
  const mrp = activeSku?.mrp ?? Math.round(price * 1.25);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const carouselImages = [
    { uri: product.thumbnailUrl ?? `https://picsum.photos/seed/${product.slug}/500/500`, key: 'main' },
    { uri: `https://picsum.photos/seed/${product.slug}1/500/500`, key: 'alt1' },
    { uri: `https://picsum.photos/seed/${product.slug}2/500/500`, key: 'alt2' },
  ];

  // ── Handlers ──
  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out ${product.title} on SpeedCopy! Starting at ₹${price}.` });
    } catch {}
  };

  const handleFileUpload = async (selectedFile: any) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type || 'application/octet-stream',
      } as any);
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        setFile({
          uri: response.data.url,
          name: selectedFile.name,
          type: response.data.resource_type,
          size: selectedFile.size,
        });
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsUploading(false);
    }
  };

  const executeAddToCart = (goToCart = false) => {
    const needsUpload = product.customizationMode === 'upload_only' || product.customizationMode === 'upload_or_editor';
    if (needsUpload && !file) {
      Alert.alert('Design Required', 'Please upload or create a design before adding to cart.');
      return;
    }
    addToCart({
      id: Math.random().toString(36).substr(2),
      cartId: 'c1',
      productId: product.id,
      product: product as any,
      skuId: activeSku?.id ?? 's1',
      sku: activeSku as any,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      deliveryMode: 'standard' as any,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedFile: file,
    });
    if (goToCart) {
      navigation.navigate('Cart');
    } else {
      Alert.alert('Added to Cart', 'Product added to your cart successfully!', [
        { text: 'Continue', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    }
  };

  const handleCTAPress = (goToCart: boolean) => {
    const mode = product.customizationMode;
    if (mode === 'none') {
      executeAddToCart(goToCart);
    } else if (mode === 'upload_only') {
      if (!file) {
        Alert.alert('Design Required', 'Please upload your design first.');
      } else {
        executeAddToCart(goToCart);
      }
    } else if (mode === 'editor_only') {
      navigation.navigate('Editor', { fileId: 'new' });
    } else if (mode === 'upload_or_editor') {
      if (file) {
        executeAddToCart(goToCart);
      } else {
        setShowDesignModal(true);
      }
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
              <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
                <Ionicons name="share-social-outline" size={22} color="#0f172a" />
              </TouchableOpacity>
            }
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* ── Carousel ── */}
        <ProductImageCarousel
          images={carouselImages}
          accentColor="#f59e0b"
          height={280}
          topRightElement={
            <FavoriteButton productId={product.id} iconSize={22} withContainer />
          }
        />

        {/* ── Info card ── */}
        <View style={styles.infoCard}>
          {/* Title + price */}
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {mrp > price && <Text style={styles.mrp}>₹{mrp}</Text>}
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
            {product.description ?? 'A quality product crafted for your everyday needs.'}
          </Text>

          {/* Qty row */}
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyControls}>
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
          </View>

          {/* Customization upload area (inline, if required) */}
          {hasCustomization && (
            <View style={styles.customizationCard}>
              <Text style={styles.sectionHeading}>Personalize Product</Text>
              {(product.customizationMode === 'upload_only' || product.customizationMode === 'upload_or_editor') && (
                <FileUploadDropzone
                  onFileSelect={handleFileUpload}
                  selectedFile={file}
                  isUploading={isUploading}
                />
              )}
              {(product.customizationMode === 'editor_only' || product.customizationMode === 'upload_or_editor') && (
                <TouchableOpacity
                  style={styles.editorBtn}
                  onPress={() => navigation.navigate('Editor', { fileId: 'new' })}
                >
                  <Ionicons name="color-palette-outline" size={18} color="#fff" />
                  <Text style={styles.editorBtnText}>Create Design in Editor</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* CTAs */}
          <TouchableOpacity style={styles.buyNowBtn} onPress={() => handleCTAPress(true)} activeOpacity={0.85}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCartBtn} onPress={() => handleCTAPress(false)} activeOpacity={0.85}>
            <Text style={styles.addCartText}>Add to Cart</Text>
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

      {/* ── Design options modal ── */}
      <DesignOptionsModal
        visible={showDesignModal}
        onClose={() => setShowDesignModal(false)}
        onSelectUpload={() => setShowDesignModal(false)}
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

  infoCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  title: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  price: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  mrp: { fontSize: 14, color: '#94a3b8', textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  taxNote: { fontSize: 11, color: '#94a3b8', marginBottom: 20 },

  sectionHeading: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  description: { fontSize: 13, color: '#64748b', lineHeight: 20, marginBottom: 20 },

  qtyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  qtyLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center',
  },
  qtyValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', minWidth: 28, textAlign: 'center' },

  customizationCard: {
    backgroundColor: '#fffbeb', borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#fde68a',
  },
  editorBtn: {
    backgroundColor: '#0ea5e9', flexDirection: 'row', gap: 8, alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 12,
  },
  editorBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  buyNowBtn: {
    backgroundColor: '#0f172a', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  addCartBtn: {
    borderWidth: 1.5, borderColor: '#0f172a', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 24,
  },
  addCartText: { color: '#0f172a', fontSize: 16, fontWeight: '700' },

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

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 30, backgroundColor: '#f1f5f9' },
  tabActive: { backgroundColor: '#0f172a' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  tabContent: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16 },
  tabHeading: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  bulletText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 },
});
