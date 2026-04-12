import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onPress?: () => void; // for navigating to a dedicated search screen
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.colors.bg.muted }]}
    >
      <Ionicons name="search" size={20} color={theme.colors.fg.default} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: theme.colors.fg.default }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.fg.muted}
        value={value}
        onChangeText={onChangeText}
        editable={!onPress} // if onPress set it acts as a tappable nav element
        pointerEvents={onPress ? 'none' : 'auto'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },
});
