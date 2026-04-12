import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { FileUploadDropzone } from '../../components/common/FileUploadDropzone';
import { DesignOptionsModal } from '../../components/common/DesignOptionsModal';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { useProductDetailQuery } from '../../api/catalog.api';
import { API_BASE_URL } from '../../config/env';
import type { SKU, ProductConfigOption, ProductConfigOptionValue } from '../../types/catalog';

const { width } = Dimensions.get('window');

// Map common color names → hex for swatches
const COLOR_MAP: Record<string, string> = {
  white: '#ffffff', black: '#1a1a1a', red: '#ef4444', blue: '#3b82f6',
  green: '#22c55e', yellow: '#eab308', pink: '#ec4899', purple: '#a855f7',
  orange: '#f97316', gray: '#9ca3af', grey: '#9ca3af', brown: '#92400e',
  navy: '#1e3a5f', mix: 'linear', gold: '#f59e0b', silver: '#94a3b8',
};

const FONT_OPTIONS = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'bold', label: 'Bold' },
  { id: 'script', label: 'Script' },
];

const resolveColor = (value: string): string | null => {
  const key = value.toLowerCase().trim();
  return COLOR_MAP[key] ?? null;
};

interface SectionProps {
  number: number;
  label: string;
  rightLabel?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ number, label, rightLabel, children }) => (
  <View style={sStyles.section}>
    <View style={sStyles.sectionHeader}>
      <Text style={sStyles.sectionNum}>{number}. {label.toUpperCase()}</Text>
      {!!rightLabel && <Text style={sStyles.sectionRight}>{rightLabel}</Text>}
    </View>
    {children}
  </View>
);

const sStyles = StyleSheet.create({
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionNum: { fontSize: 12, fontWeight: '800', color: '#475569', letterSpacing: 0.5 },
  sectionRight: { fontSize: 11, color: '#94a3b8' },
});

// ─────────────────────────────────────────────
export const GiftCustomizeScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    productId, productTitle, qty = 1,
    unitPrice = 0, totalPrice: initialTotal = 0,
  } = route.params || {};

  const { data } = useProductDetailQuery(productId);

  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [configSelections, setConfigSelections] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].id);
  const [file, setFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);

  const addToCartAction = useCartStore(state => state.addToCart);

  // Set defaults when data loads
  useEffect(() => {
    if (!data) return;
    if (data.skus.length > 0 && !selectedSkuId) {
      setSelectedSkuId(data.skus[0].id);
    }
    if (Object.keys(configSelections).length === 0 && data.options.length > 0) {
      const defaults: Record<string, string> = {};
      data.options.forEach(opt => {
        const vals = data.optionValues.filter(v => v.optionId === opt.id);
        if (vals.length > 0) defaults[opt.id] = vals[0].value;
      });
      setConfigSelections(defaults);
    }
  }, [data]);

  // ── Price calculation ──
  const activeSku = data?.skus.find(s => s.id === selectedSkuId) ?? data?.skus[0];
  let finalUnitPrice = activeSku?.sellingPrice ?? unitPrice;

  Object.keys(configSelections).forEach(optId => {
    const val = data?.optionValues.find(v => v.optionId === optId && v.value === configSelections[optId]);
    if (val) finalUnitPrice += val.priceDelta;
  });

  const totalPayable = finalUnitPrice * qty;

  // ── File upload ──
  const handleFileSelect = async (selectedFile: any) => {
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
        Alert.alert('Success', 'Logo uploaded!');
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Add to cart ──
  const handleAddToCart = (navigateToCart = false) => {
    if (!data) return;
    const newJobId = Math.random().toString(36).substring(7);
    const cartItem = {
      id: newJobId,
      cartId: 'c1',
      productId: productId || 'gift-product',
      product: { id: productId || 'gift-product', title: productTitle || 'Gift Item' } as any,
      skuId: activeSku?.id ?? 'gift-sku',
      sku: activeSku as any,
      quantity: qty,
      unitPrice: finalUnitPrice,
      totalPrice: totalPayable,
      customizationNotes: customText,
      uploadedFile: file,
      configSelections,
      deliveryMode: 'standard' as any,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addToCartAction(cartItem);
    if (navigateToCart) {
      navigation.navigate('Cart');
    } else {
      Alert.alert('Added!', 'Product added to cart.', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    }
  };

  // ── Option renderer helpers ──
  const renderSkuSelector = (skus: SKU[]) => (
    <Section number={1} label="Size" rightLabel={activeSku ? `${activeSku.title} selected` : ''}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {skus.map(sku => {
          const isSelected = sku.id === selectedSkuId;
          return (
            <TouchableOpacity
              key={sku.id}
              onPress={() => setSelectedSkuId(sku.id)}
              style={[styles.skuCard, isSelected && styles.skuCardSelected]}
            >
              <Ionicons name="cube-outline" size={24} color={isSelected ? '#e91e8c' : '#64748b'} style={{ marginBottom: 6 }} />
              <Text style={[styles.skuLabel, isSelected && styles.skuLabelSelected]}>{sku.title}</Text>
              <Text style={[styles.skuPrice, isSelected && { color: '#e91e8c' }]}>
                ₹{sku.sellingPrice}
              </Text>
              {isSelected && (
                <View style={styles.skuCheckMark}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Section>
  );

  const renderColorOption = (opt: ProductConfigOption, values: ProductConfigOptionValue[], sectionNum: number) => {
    const selected = configSelections[opt.id];
    return (
      <Section key={opt.id} number={sectionNum} label={opt.label} rightLabel="Scroll for more">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {values.map(val => {
            const hex = resolveColor(val.value);
            const isSelected = selected === val.value;
            return (
              <TouchableOpacity
                key={val.id}
                onPress={() => setConfigSelections(prev => ({ ...prev, [opt.id]: val.value }))}
                style={styles.colorOption}
              >
                {hex ? (
                  <View style={[
                    styles.colorSwatch,
                    { backgroundColor: hex },
                    hex === '#ffffff' && styles.colorSwatchWhite,
                    isSelected && styles.colorSwatchSelected,
                  ]}>
                    {isSelected && (
                      <View style={[styles.colorCheck, { backgroundColor: hex === '#ffffff' ? '#0f172a' : 'rgba(255,255,255,0.85)' }]}>
                        <Ionicons name="checkmark" size={10} color={hex === '#ffffff' ? '#fff' : '#0f172a'} />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={[styles.colorSwatch, styles.colorSwatchPill, isSelected && { borderColor: '#e91e8c' }]}>
                    <Text style={[styles.colorPillText, isSelected && { color: '#e91e8c' }]}>{val.label}</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={[styles.colorLabel, isSelected && { color: '#e91e8c', fontWeight: '700' }]}>
                  {val.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Section>
    );
  };

  const renderGenericOption = (opt: ProductConfigOption, values: ProductConfigOptionValue[], sectionNum: number) => {
    const selected = configSelections[opt.id];
    return (
      <Section key={opt.id} number={sectionNum} label={opt.label}>
        <View style={styles.pillRow}>
          {values.map(val => {
            const isSelected = selected === val.value;
            return (
              <TouchableOpacity
                key={val.id}
                onPress={() => setConfigSelections(prev => ({ ...prev, [opt.id]: val.value }))}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {val.label}{val.priceDelta > 0 ? ` (+₹${val.priceDelta})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>
    );
  };

  const heroUri = data 
    ? `https://picsum.photos/seed/${data.product.slug}/400/400` 
    : `https://picsum.photos/seed/gift/400/400`;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScreenWrapper
        backgroundColor="#f8fafc"
        fixedHeader={<Header title="Customize" />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Product image */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: heroUri }} style={styles.heroImage} />
          <TouchableOpacity style={styles.rotateBtn}>
            <Ionicons name="sync-outline" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* SKU / Size selector */}
          {data && data.skus.length > 0 && renderSkuSelector(data.skus)}

          {/* Dynamic config options */}
          {data?.options.map((opt, idx) => {
            const values = data.optionValues.filter(v => v.optionId === opt.id);
            const sectionNum = idx + 2; // starts after Size (1)
            const isColor = opt.key?.toLowerCase().includes('color') || opt.label?.toLowerCase().includes('color');
            return isColor
              ? renderColorOption(opt, values, sectionNum)
              : renderGenericOption(opt, values, sectionNum);
          })}

          {/* Personalization section */}
          <Section number={(data?.options.length ?? 0) + 2} label="Personalization">
            <TextInput
              style={styles.textInput}
              placeholder="Enter your text"
              placeholderTextColor="#94a3b8"
              value={customText}
              onChangeText={setCustomText}
              maxLength={60}
            />

            {/* Font picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
              {FONT_OPTIONS.map(f => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setSelectedFont(f.id)}
                  style={[styles.fontPill, selectedFont === f.id && styles.fontPillSelected]}
                >
                  <Text style={[styles.fontPillText, selectedFont === f.id && styles.fontPillTextSelected]}>
                    {f.label}
                  </Text>
                  {selectedFont === f.id && (
                    <Ionicons name="chevron-down" size={12} color="#e91e8c" style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* File upload */}
            {data?.product.customizationMode !== 'none' && (
              <FileUploadDropzone
                onFileSelect={handleFileSelect}
                selectedFile={file}
                isUploading={isUploading}
              />
            )}
          </Section>
        </View>
      </ScreenWrapper>

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.priceRow}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPrice}>₹{totalPayable.toFixed(0)}</Text>
        </View>
        <View style={styles.footerBtns}>
          <TouchableOpacity style={styles.buyBtn} onPress={() => handleAddToCart(true)} activeOpacity={0.85}>
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn} onPress={() => handleAddToCart(false)} activeOpacity={0.85}>
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  heroWrapper: {
    margin: 16,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  rotateBtn: {
    position: 'absolute', bottom: 12, right: 12,
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },

  formContainer: { paddingHorizontal: 20, paddingTop: 8 },

  // SKU cards
  skuCard: {
    width: 90, paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: '#fff', borderRadius: 16, alignItems: 'center',
    borderWidth: 2, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    position: 'relative',
  },
  skuCardSelected: { borderColor: '#e91e8c', backgroundColor: '#fff0f6' },
  skuLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 2 },
  skuLabelSelected: { color: '#e91e8c' },
  skuPrice: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  skuCheckMark: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#e91e8c',
    justifyContent: 'center', alignItems: 'center',
  },

  // Color swatches
  colorOption: { alignItems: 'center', width: 52 },
  colorSwatch: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6, borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2,
  },
  colorSwatchWhite: { borderColor: '#e2e8f0' },
  colorSwatchSelected: { borderColor: '#e91e8c', borderWidth: 3 },
  colorSwatchPill: {
    width: 'auto', height: 'auto', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: '#e2e8f0',
  },
  colorCheck: {
    width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  colorPillText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  colorLabel: { fontSize: 10, color: '#475569', textAlign: 'center', fontWeight: '500' },

  // Generic pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#f1f5f9', borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  pillSelected: { backgroundColor: '#fff0f6', borderColor: '#e91e8c' },
  pillText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  pillTextSelected: { color: '#e91e8c', fontWeight: '700' },

  // Personalization
  textInput: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a',
    backgroundColor: '#fff', marginBottom: 12,
  },
  fontPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#f1f5f9', borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  fontPillSelected: { backgroundColor: '#fff0f6', borderColor: '#e91e8c' },
  fontPillText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  fontPillTextSelected: { color: '#e91e8c' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  footerPriceLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  footerPrice: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  footerBtns: { flexDirection: 'row', gap: 12 },
  buyBtn: { flex: 1, backgroundColor: '#0f172a', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cartBtn: { flex: 1, borderWidth: 1.5, borderColor: '#0f172a', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff' },
  cartBtnText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
});
