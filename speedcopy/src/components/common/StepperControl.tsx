import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

interface StepperControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  style?: any;
}

export const StepperControl: React.FC<StepperControlProps> = ({
  label,
  value,
  min = 1,
  max = 999,
  onChange,
  style,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  // Format number to '01', '02' if less than 10
  const displayValue = value < 10 ? `0${value}` : `${value}`;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepperBox}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleDecrement}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={16} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.valueText}>{displayValue}</Text>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
    flex: 1, // allows wrapping if long
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
});
