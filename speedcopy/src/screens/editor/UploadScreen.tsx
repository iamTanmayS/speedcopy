import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { FileUploadDropzone } from '../../components/common/FileUploadDropzone';
import { PrintOptionAccordion } from '../../components/common/PrintOptionAccordion';
import { StepperControl } from '../../components/common/StepperControl';
import { FloatingPricingFooter } from '../../components/common/FloatingPricingFooter';
import { useBuilderStore } from '../../state_mgmt/store/builderStore';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { API_BASE_URL } from '../../config/env';

export const UploadScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isUploading, setIsUploading] = useState(false);
  
  // Hide bottom tabs exactly when this screen mounts
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
    return () => {
      if (parent) {
        parent.setOptions({ tabBarStyle: { display: 'flex' } });
      }
    };
  }, [navigation]);

  // State from builderStore
  const { currentJob, setOptions, setFile, calculatePrice, resetBuilder } = useBuilderStore();
  const addToCartAction = useCartStore((state) => state.addToCart);

  const colorMode = currentJob.options?.colorMode || '';
  const pageSize = currentJob.options?.pageSize || '';
  const printSide = currentJob.options?.printSide || '';
  const coverPageColor = currentJob.options?.coverPageColor || '';
  const copies = currentJob.options?.copies || 1;
  const linearGraphAddon = currentJob.options?.linearGraphAddon || 0;
  const semiLogGraphAddon = currentJob.options?.semiLogGraphAddon || 0;
  const instructions = currentJob.options?.instructions || '';

  // Pricing calculations
  const basePrice = calculatePrice();
  const discountAmount = basePrice >= 100 ? 15 : 0;
  const totalPayable = basePrice > 0 ? basePrice - discountAmount : 0;

  const handleFileSelect = async (file: any) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type || 'application/octet-stream',
      } as any);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setFile({
          uri: response.data.url,
          name: file.name,
          type: response.data.resource_type,
          size: file.size,
        });
        Alert.alert('Success', 'File uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Something went wrong during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToCart = () => {
    if (!currentJob.file) {
      Alert.alert('Wait', 'Please upload a document before adding to cart.');
      return;
    }

    // Mapping PrintJob to CartItem structure
    const newJobId = Math.random().toString(36).substring(7);
    const finalJob = {
      ...currentJob,
      id: newJobId,
      quantity: copies,
      unitPrice: basePrice / copies,
      totalPrice: totalPayable,
      product: {
        id: route.params?.productId || 'printing-product',
        title: currentJob.category || 'Document Printing',
      },
      sku: {
        id: 'printing-sku',
        title: `${colorMode} | ${pageSize}`,
      },
      addedAt: new Date().toISOString(),
    };
    
    addToCartAction(finalJob as any);
    resetBuilder();
    navigation.navigate('Cart');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.muted }}>
      <ScreenWrapper
        backgroundColor={theme.colors.bg.muted}
        fixedHeader={<Header title="Printing" />}
        contentContainerStyle={{ paddingBottom: 220 }} // padding to rise above floating footer and heart
        showFooter={true}
        withBottomNavPadding={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.pageTitle}>Print your documents</Text>
          <Text style={styles.pageSubtitle}>Select your document or image to get started</Text>

          <FileUploadDropzone 
            onFileSelect={handleFileSelect}
            selectedFile={currentJob.file}
            isUploading={isUploading}
          />

          <PrintOptionAccordion
            label="Color Mode"
            options={['B&W', 'color', 'Custom']}
            selectedOption={colorMode}
            onSelect={(v) => setOptions({ colorMode: v })}
          />

          <PrintOptionAccordion
            label="Page size"
            options={['A4', 'A3']}
            selectedOption={pageSize}
            onSelect={(v) => setOptions({ pageSize: v })}
          />

          <PrintOptionAccordion
            label="Print Side"
            options={['one-sided', 'Two-sided', '4 in 1 (2 front+2 Back)']}
            selectedOption={printSide}
            onSelect={(v) => setOptions({ printSide: v })}
          />

          <PrintOptionAccordion
            label="Cover page color"
            options={['Blue', 'Green', 'Pink']}
            selectedOption={coverPageColor}
            onSelect={(v) => setOptions({ coverPageColor: v })}
          />

          <StepperControl
            label="Number of copies"
            value={copies}
            onChange={(v) => setOptions({ copies: v })}
            min={1}
            max={100}
            style={{ marginTop: 8 }}
          />

          <Text style={styles.sectionLabel}>Addon's</Text>
          <View style={styles.addonContainer}>
            <StepperControl
              label="Linear Graph Sheets"
              value={linearGraphAddon}
              onChange={(v) => setOptions({ linearGraphAddon: v })}
              min={0}
              max={100}
              style={{ marginBottom: 12 }}
            />
            <StepperControl
              label="Semi Log Graph sheets"
              value={semiLogGraphAddon}
              onChange={(v) => setOptions({ semiLogGraphAddon: v })}
              min={0}
              max={100}
              style={{ marginBottom: 0 }}
            />
          </View>

          <Text style={styles.sectionLabel}>Special Instructions</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Type your instruction here"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={instructions}
              onChangeText={(v) => setOptions({ instructions: v })}
            />
          </View>

          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About the Service</Text>
            <Text style={styles.aboutText}>
              Instant Printing (within one hour){'\n'}
              Get your documents printed quickly and professionally with SpeedCopy. We offer high-quality black & white or color printing on 75 GSM paper, ideal for everyday use — from assignments and reports to official documents.{'\n'}
              * Sharp, clear prints, Standard A4 size{'\n'}
              * Reliable 75 GSM paper for smooth handling{'\n'}
              * Upload PDFs or images directly in the app{'\n'}
              * Fast turnaround & doorstep delivery (if available){'\n'}
              Print smart. Print fast. Only with SpeedCopy.
            </Text>
          </View>

        </View>
      </ScreenWrapper>

      {/* Reusable Floating Pricing Footer mapped to dynamic state */}
      <FloatingPricingFooter 
        basePrice={basePrice}
        discountAmount={discountAmount}
        totalPayable={totalPayable}
        savingsText={discountAmount > 0 ? `You saved ₹${discountAmount} on this order` : undefined}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
    marginTop: 8,
  },
  addonContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textAreaContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 13,
    color: '#000',
  },
  aboutContainer: {
    marginBottom: 40,
  },
  aboutTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  aboutText: {
    fontSize: 9, // Small footnote logic matching image mapping
    lineHeight: 13,
    color: '#000',
  },
});
