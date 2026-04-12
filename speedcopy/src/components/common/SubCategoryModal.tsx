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

const { width, height } = Dimensions.get('window');

export interface SubCategoryOption {
  id: string;
  title: string;
  subtitle?: string;
}

interface SubCategoryModalProps {
  visible: boolean;
  productTitle?: string;
  options: SubCategoryOption[];
  onClose: () => void;
  onSelectOption: (option: SubCategoryOption) => void;
}

const ICONS = ['document-text', 'briefcase', 'journal', 'school', 'book', 'megaphone'];

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({
  visible,
  productTitle,
  options,
  onClose,
  onSelectOption,
}) => {
  const { theme } = useTheme();

  const blurIntensity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      blurIntensity.setValue(0);
      translateY.setValue(80);
      opacity.setValue(0);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.timing(blurIntensity, { toValue: 1, duration: 300, useNativeDriver: false }),
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

  const interpolatedBlur = blurIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });

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
                { opacity, transform: [{ translateY }, { scale }] },
              ]}
            >
              {productTitle ? (
                <Text style={styles.containerText}>
                  How do you want to print "{productTitle}"?
                </Text>
              ) : (
                <Text style={styles.containerText}>Select a print type</Text>
              )}

              <View style={styles.gridContainer}>
                {options.map((opt, index) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() => onSelectOption(opt)}
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons name={ICONS[index % ICONS.length] as any} size={28} color="#1e293b" />
                    </View>
                    <Text style={styles.titleText}>{opt.title}</Text>
                    {opt.subtitle ? (
                      <Text style={styles.subtitleText}>{opt.subtitle}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
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
    padding: 16,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContainer: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#7a7a7a',
    padding: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  containerText: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#6b7280',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  subtitleText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
});
