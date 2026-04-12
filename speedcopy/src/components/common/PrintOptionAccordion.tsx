import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

interface PrintOptionAccordionProps {
  label: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  defaultExpanded?: boolean;
}

export const PrintOptionAccordion: React.FC<PrintOptionAccordionProps> = ({
  label,
  options,
  selectedOption,
  onSelect,
  defaultExpanded = true,
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[styles.accordionBox, { backgroundColor: theme.colors.bg.default }]}>
        <TouchableOpacity 
          style={styles.header} 
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Text style={styles.headerText}>Select Input</Text>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
          </Animated.View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.optionsContainer}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionRow}
                onPress={() => {
                  onSelect(opt);
                }}
              >
                <Text style={[
                  styles.optionText, 
                  selectedOption === opt && styles.optionTextSelected
                ]}>
                  {opt}
                </Text>
                {selectedOption === opt && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  accordionBox: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#2563eb',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
});
