import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

interface FilterButtonProps {
  onPress?: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.fg.default }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name="options" size={20} color={theme.colors.bg.default} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
