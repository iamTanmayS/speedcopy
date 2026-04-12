import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../../theme';

export const SearchScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Search Products</Text>
      <TextInput 
        style={[styles.input, { borderColor: theme.colors.fg.muted, color: theme.colors.fg.default }]}
        placeholder="Search for Business Cards, Mugs..."
        placeholderTextColor={theme.colors.fg.muted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
});
