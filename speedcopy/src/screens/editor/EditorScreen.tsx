import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Alert, ActivityIndicator, } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView,  useSafeAreaInsets  } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useBuilderStore } from '../../state_mgmt/store/builderStore';
import { fabricEditorHtml } from './fabricEditorHtml';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PAGE_SIZES = [
  { label: 'A4',          width: 794, height: 1123 },
  { label: 'A3',          width: 1123, height: 1587 },
  { label: 'Square',      width: 800, height: 800 },
  { label: 'Business',    width: 1004, height: 650 },
  { label: 'Landscape A4',width: 1123, height: 794 },
];

// WebView canvas dimensions — always fits screen width
const CANVAS_W = Math.floor(SCREEN_WIDTH - 0);
const CANVAS_H = Math.floor(SCREEN_HEIGHT * 0.55);

export const EditorScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const { setFile } = useBuilderStore();

  // --- Hide bottom tabs ---
  // EditorScreen is 2 levels deep: EditorScreen → HomeStack → MainTabNavigator
  // We must go up 2 levels to update the tab navigator that CustomTabBar reads from.
  useEffect(() => {
    const tabNav = navigation.getParent?.()?.getParent?.();
    tabNav?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNav?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  // --- Injext JS into WebView ---
  const injectJS = useCallback((script: string) => {
    const js = `
      try {
        ${script}
      } catch (e) {}
      true;
    `;
    webviewRef.current?.injectJavaScript(js);
  }, []);

  // --- Trigger export ---
  const handleSave = () => {
    setIsExporting(true);
    injectJS('window.exportImage();');
  };

  // --- Receive messages from WebView ---
  const handleMessage = useCallback(async (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'EXPORT_IMAGE') {
        const base64Data = msg.data.replace(/^data:image\/png;base64,/, '');
        const fileName = `design_${Date.now()}.png`;
        const fileUri = FileSystem.cacheDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setFile({ uri: fileUri, name: fileName, type: 'image/png' });
        setIsExporting(false);
        navigation.navigate('Upload', { fromEditor: true });
      }

      if (msg.type === 'PICK_IMAGE') {
        // Native image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
          const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
          injectJS(`window.insertImage('${dataUrl}');`);
        }
        setIsExporting(false);
      }
    } catch (err) {
      console.error('WebView message error', err);
      setIsExporting(false);
    }
  }, [navigation, setFile, injectJS]);

  const applyPageSize = (index: number) => {
    setSelectedSize(index);
    setShowSizePicker(false);
    const size = PAGE_SIZES[index];
    injectJS(`window.setSize(${size.width}, ${size.height});`);
  };

  const html = fabricEditorHtml(CANVAS_W, CANVAS_H);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ===== TOP BAR ===== */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sizeChip} onPress={() => setShowSizePicker(v => !v)}>
          <Ionicons name="document-outline" size={14} color="#475569" />
          <Text style={styles.sizeChipText}>{PAGE_SIZES[selectedSize].label}</Text>
          <Ionicons name="chevron-down" size={12} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isExporting && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isExporting}
        >
          {isExporting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Save →</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ===== PAGE SIZE DROPDOWN ===== */}
      {showSizePicker && (
        <View style={styles.sizePicker}>
          {PAGE_SIZES.map((s, i) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.sizeItem, i === selectedSize && styles.sizeItemActive]}
              onPress={() => applyPageSize(i)}
            >
              <Text style={[styles.sizeItemText, i === selectedSize && { color: '#3b82f6', fontWeight: '700' }]}>
                {s.label}
              </Text>
              <Text style={styles.sizeItemDim}>{s.width}×{s.height}px</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ===== WEBVIEW EDITOR ===== */}
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://speedcopy.local' }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        mixedContentMode="always"
        allowsFullscreenVideo={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sizeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  saveBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  webview: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  sizePicker: {
    position: 'absolute',
    top: 58,
    left: '50%',
    transform: [{ translateX: -120 }],
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 99,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  sizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sizeItemActive: {
    backgroundColor: '#eff6ff',
  },
  sizeItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  sizeItemDim: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
