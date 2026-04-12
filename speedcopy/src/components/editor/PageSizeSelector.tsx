import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { PageSize, useEditorStore } from '../../state_mgmt/store/editorStore';

interface PageSizeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const PAGE_SIZES: { id: PageSize, label: string, icon: string, desc: string }[] = [
  { id: 'A4', label: 'A4 Document', icon: 'document-text-outline', desc: 'Standard business size (21.0 x 29.7 cm)' },
  { id: 'A3', label: 'A3 Poster', icon: 'image-outline', desc: 'Large posters & architectural plans' },
  { id: 'Square', label: 'Square Post', icon: 'square-outline', desc: 'Social media flyers (1:1)' },
  { id: 'BusinessCard', label: 'Business Card', icon: 'card-outline', desc: 'Personal & Professional contact cards' },
];

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { pageSize, setPageSize } = useEditorStore();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: '#fff' }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Canvas Size</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {PAGE_SIZES.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.card,
                  pageSize === size.id && { borderColor: theme.colors.accent.default, backgroundColor: theme.colors.accent.default + '05' }
                ]}
                onPress={() => {
                  setPageSize(size.id);
                  onClose();
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.colors.bg.muted }]}>
                  <Ionicons name={size.icon as any} size={24} color={pageSize === size.id ? theme.colors.accent.default : '#64748b'} />
                </View>
                <View style={styles.textBox}>
                  <Text style={[styles.cardTitle, pageSize === size.id && { color: theme.colors.accent.default }]}>
                    {size.label}
                  </Text>
                  <Text style={styles.cardDesc}>{size.desc}</Text>
                </View>
                {pageSize === size.id && <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent.default} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  list: {
    marginBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
  },
  cardDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});
