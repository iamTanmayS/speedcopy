import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

const { width } = Dimensions.get('window');

interface DesignOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUpload: () => void;
  onSelectEditor: () => void;
}

export const DesignOptionsModal: React.FC<DesignOptionsModalProps> = ({
  visible,
  onClose,
  onSelectUpload,
  onSelectEditor,
}) => {
  const { theme } = useTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(80)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translateY.setValue(80);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 60, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View style={[StyleSheet.absoluteFillObject, { opacity }]}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFillObject} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.darkOverlay, { opacity }]} />

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.bg.default, opacity, transform: [{ translateY }, { scale }] },
              ]}
            >
              <Text style={[styles.title, { color: theme.colors.fg.default }]}>Design Options</Text>
              <Text style={[styles.subtitle, { color: theme.colors.fg.muted }]}>
                How would you like to prepare your design?
              </Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionCard, { borderColor: theme.colors.bg.muted }]}
                  onPress={onSelectUpload}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#db2777" />
                  </View>
                  <Text style={[styles.optionTitle, { color: theme.colors.fg.default }]}>Upload File</Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.fg.muted }]}>
                    Already have a design? Upload it here.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, { borderColor: theme.colors.bg.muted }]}
                  onPress={onSelectEditor}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="color-palette-outline" size={32} color="#2563eb" />
                  </View>
                  <Text style={[styles.optionTitle, { color: theme.colors.fg.default }]}>Use Editor</Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.fg.muted }]}>
                    Create your design using our editor.
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={[styles.cancelText, { color: theme.colors.fg.muted }]}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
    flex: 1,
  },
  cancelButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
