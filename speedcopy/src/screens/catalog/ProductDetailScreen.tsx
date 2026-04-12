import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { useProductDetailQuery } from '../../api/catalog.api';
import type { ProductDetailResponse, SKU, ProductConfigOption, ProductConfigOptionValue, QuantitySlab } from '../../types/catalog';
import { FavoriteButton } from '../../components/common/FavoriteButton';

export const ProductDetailScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { productId } = route.params || {};
  const { addToCart } = useCartStore();

  const { data, isLoading, isError } = useProductDetailQuery(productId);

  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [configSelections, setConfigSelections] = useState<Record<string, string>>({});
  const [qty, setQty] = useState<number>(100);

  useEffect(() => {
    if (data) {
      if (data.skus.length > 0 && !selectedSkuId) {
         setSelectedSkuId(data.skus[0].id);
      }
      
      if (Object.keys(configSelections).length === 0) {
        const defaults: Record<string, string> = {};
        data.options.forEach(opt => {
           const vals = data.optionValues.filter(v => v.optionId === opt.id);
           if (vals.length > 0) defaults[opt.id] = vals[0].value;
        });
        setConfigSelections(defaults);
      }
    }
  }, [data]);
  if (isLoading || !data) return <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.accent.default} /></View>;
  if (isError) return <View style={styles.loading}><Text style={{color: 'red'}}>Failed to load product.</Text></View>;

  const activeSku = data.skus.find(s => s.id === selectedSkuId);
  
  // Calculate final unit price
  let finalUnitPrice = activeSku ? activeSku.sellingPrice : 0;

  // Apply slab logic if active
  if (activeSku) {
      const activeSlabs = data.slabs.filter(s => s.skuId === activeSku.id);
      const eligibleSlab = activeSlabs.find(s => qty >= s.minQty && (!s.maxQty || qty <= s.maxQty));
      if (eligibleSlab) finalUnitPrice = eligibleSlab.unitPrice;
  }

  // Apply config deltas
  Object.keys(configSelections).forEach(optId => {
      const val = data.optionValues.find(v => v.optionId === optId && v.value === configSelections[optId]);
      if (val) finalUnitPrice += val.priceDelta;
  });

  const totalPrice = finalUnitPrice * qty;

  const handleContinue = () => {
    if (!activeSku) return;

    if (data.product.customizationMode === 'none') {
        addToCart({
            id: Math.random().toString(),
            cartId: 'c1',
            productId: data.product.id,
            skuId: activeSku.id,
            quantity: qty,
            unitPrice: finalUnitPrice,
            totalPrice: totalPrice,
            deliveryMode: 'standard' as any,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            configSelections
        });
        navigation.navigate('Cart');
        return;
    }

    if (data.product.customizationMode === 'upload_only') {
        navigation.navigate('GiftCustomize', { 
            productId: data.product.id,
            productTitle: data.product.title,
            skuId: activeSku.id,
            skuTitle: activeSku.title,
            qty,
            configSelections,
            unitPrice: finalUnitPrice,
            totalPrice
        });
        return;
    }

    if (data.product.customizationMode === 'editor_only') {
        navigation.navigate('Editor', { fileId: 'new' });
        return;
    }

    if (data.product.customizationMode === 'upload_or_editor') {
        Alert.alert(
            "Design Options",
            "How would you like to prepare your design?",
            [
                { text: "Upload File", onPress: () => navigation.navigate('GiftCustomize', { 
                    productId: data.product.id,
                    productTitle: data.product.title,
                    skuId: activeSku.id,
                    skuTitle: activeSku.title,
                    qty,
                    configSelections,
                    unitPrice: finalUnitPrice,
                    totalPrice
                }) },
                { text: "Use Editor", onPress: () => navigation.navigate('Editor', { fileId: 'new' }) },
                { text: "Cancel", style: "cancel" }
            ]
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScreenWrapper
        backgroundColor="#f8fafc"
        fixedHeader={
            <Header 
                title={data.product.title} 
                rightElement={
                    <FavoriteButton productId={data.product.id} iconSize={24} withContainer={false} style={{ padding: 8 }} />
                }
            />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.content}>
           <Text style={styles.description}>{data.product.description}</Text>

           {/* SKU Selection */}
           <Text style={styles.sectionTitle}>Select Variants</Text>
           {data.skus.map(sku => (
               <TouchableOpacity 
                  key={sku.id}
                  style={[styles.optionCard, selectedSkuId === sku.id && styles.optionCardSelected]}
                  onPress={() => setSelectedSkuId(sku.id)}
               >
                   <View style={{ flex: 1 }}>
                     <Text style={styles.optionTitle}>{sku.title}</Text>
                     <Text style={styles.optionSubtitle}>₹{sku.sellingPrice} / unit</Text>
                   </View>
                   <View style={[styles.radio, selectedSkuId === sku.id && styles.radioSelected]}>
                      {selectedSkuId === sku.id && <View style={styles.radioInner} />}
                   </View>
               </TouchableOpacity>
           ))}

           {/* Config Options */}
           {data.options.map(opt => (
               <View key={opt.id} style={{ marginTop: 24 }}>
                   <Text style={styles.sectionTitle}>{opt.label}</Text>
                   <View style={styles.configGrid}>
                     {data.optionValues.filter(v => v.optionId === opt.id).map(val => (
                         <TouchableOpacity
                             key={val.id}
                             style={[styles.configPill, configSelections[opt.id] === val.value && styles.configPillSelected]}
                             onPress={() => setConfigSelections(prev => ({ ...prev, [opt.id]: val.value }))}
                         >
                             <Text style={[styles.configPillText, configSelections[opt.id] === val.value && styles.configPillTextSelected]}>
                                 {val.label} {val.priceDelta > 0 ? `(+₹${val.priceDelta})` : ''}
                             </Text>
                         </TouchableOpacity>
                     ))}
                   </View>
               </View>
           ))}
        </View>
      </ScreenWrapper>

      {/* Floating CTA */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
             <Text style={styles.priceLabel}>Total Amount:</Text>
             <Text style={styles.priceValue}>₹{totalPrice.toFixed(2)}</Text>
         </View>
         <TouchableOpacity style={styles.ctaButton} onPress={handleContinue}>
             <Text style={styles.ctaText}>{data.product.primaryCTA === 'edit_and_print' ? 'Checkout & Print' : 'Continue Customizing'}</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  description: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: '#fff'
  },
  optionCardSelected: { borderColor: '#0f172a', backgroundColor: '#f8fafc' },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  optionSubtitle: { fontSize: 14, color: '#64748b' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#0f172a' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0f172a' },
  configGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  configPill: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  configPillSelected: { borderColor: '#0f172a', backgroundColor: '#0f172a' },
  configPillText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  configPillTextSelected: { color: '#fff' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingHorizontal: 20, paddingTop: 16 },
  priceLabel: { fontSize: 14, color: '#64748b' },
  priceValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  ctaButton: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
