import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme';
import { useEditorStore } from '../../state_mgmt/store/editorStore';

const COLORS = ['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const EditorToolbar: React.FC = () => {
  const { theme } = useTheme();
  const { addElement, selectedElementId, elements, updateElement } = useEditorStore();
  
  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleAddText = () => {
    addElement({
      type: 'text',
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      rotation: 0,
      content: 'Tap to edit',
      style: {
        fontSize: 24,
        color: '#000000',
        fontWeight: 'bold',
      }
    });
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      addElement({
        type: 'image',
        x: 50,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        content: result.assets[0].uri,
      });
    }
  };

  const handleAddShape = () => {
    addElement({
      type: 'shape',
      x: 100,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      content: '',
      style: {
        color: '#3b82f6',
        borderRadius: 8,
      }
    });
  };

  const updateSelectedStyle = (updates: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, {
        style: { ...selectedElement?.style, ...updates }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#fff', borderTopColor: '#e2e8f0' }]}>
      {selectedElement ? (
        <View style={styles.contextBar}>
          <TouchableOpacity style={styles.closeContext} onPress={() => useEditorStore.getState().selectElement(null)}>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {selectedElement.type === 'text' && (
              <>
                <TouchableOpacity style={styles.toolBtn} onPress={() => updateSelectedStyle({ fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold' })}>
                  <Ionicons name="text" size={20} color={selectedElement.style?.fontWeight === 'bold' ? theme.colors.accent.default : '#475569'} />
                  <Text style={styles.toolText}>Bold</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={() => {
                   const curSize = selectedElement.style?.fontSize || 20;
                   updateSelectedStyle({ fontSize: curSize + 2 });
                }}>
                  <Ionicons name="add-circle-outline" size={20} color="#475569" />
                  <Text style={styles.toolText}>Size+</Text>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.toolBtn} onPress={() => {
                   const curSize = selectedElement.style?.fontSize || 20;
                   updateSelectedStyle({ fontSize: Math.max(8, curSize - 2) });
                }}>
                  <Ionicons name="remove-circle-outline" size={20} color="#475569" />
                  <Text style={styles.toolText}>Size-</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolBtn} onPress={() => {
                  if (selectedElementId) {
                    updateElement(selectedElementId, { rotation: (selectedElement.rotation + 15) % 360 });
                  }
                }}>
                  <Ionicons name="refresh-outline" size={20} color="#475569" />
                  <Text style={styles.toolText}>Rotate</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedElement.type !== 'text' && (
              <>
                 <TouchableOpacity style={styles.toolBtn} onPress={() => {
                  if (selectedElementId) {
                    updateElement(selectedElementId, { 
                      width: selectedElement.width * 1.1,
                      height: selectedElement.height * 1.1
                    });
                  }
                }}>
                  <Ionicons name="expand-outline" size={20} color="#475569" />
                  <Text style={styles.toolText}>Grow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={() => {
                  if (selectedElementId) {
                    updateElement(selectedElementId, { 
                      width: selectedElement.width * 0.9,
                      height: selectedElement.height * 0.9
                    });
                  }
                }}>
                  <Ionicons name="contract-outline" size={20} color="#475569" />
                  <Text style={styles.toolText}>Shrink</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={() => {
                  if (selectedElementId) {
                    updateElement(selectedElementId, { rotation: (selectedElement.rotation + 15) % 360 });
                  }
                }}>
                  <Ionicons name="refresh-outline" size={20} color="#475569" />
                  <Text style={styles.toolText}>Rotate</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Color Palette */}
            <View style={styles.divider} />
            {COLORS.map(color => (
              <TouchableOpacity 
                key={color} 
                style={[styles.colorBubble, { backgroundColor: color, borderWidth: selectedElement.style?.color === color ? 2 : 0, borderColor: theme.colors.accent.default }]} 
                onPress={() => updateSelectedStyle({ color: color })}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.actionBar}>
           <TouchableOpacity style={styles.actionBtn} onPress={handleAddText}>
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="text-outline" size={22} color="#2563eb" />
            </View>
            <Text style={styles.actionText}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleAddImage}>
            <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
              <Ionicons name="image-outline" size={22} color="#db2777" />
            </View>
            <Text style={styles.actionText}>Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleAddShape}>
            <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="square-outline" size={22} color="#d97706" />
            </View>
            <Text style={styles.actionText}>Shape</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Coming Soon', 'Page templates are being prepared!')}>
            <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="duplicate-outline" size={22} color="#16a34a" />
            </View>
            <Text style={styles.actionText}>Template</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  actionBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  contextBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeContext: {
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
  },
  toolBtn: {
    alignItems: 'center',
    gap: 2,
  },
  toolText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
  },
  colorBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#f1f5f9',
  }
});
