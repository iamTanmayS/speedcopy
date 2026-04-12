import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

export const LiveMapScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Tracking Map</Text>
      <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.bg.muted }]}>
        <Text style={{ color: theme.colors.fg.muted }}>[ Live Map Interface Placeholder ]</Text>
        <Text style={{ color: theme.colors.fg.muted, marginTop: 10 }}>"Coming to you via SpeedCopy"</Text>
      </View>
      <View style={styles.footer}>
        <Text style={{ color: theme.colors.fg.default }}>Delivery Partner identity hidden for your privacy.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  footer: { marginTop: 20, padding: 10, alignItems: 'center' },
});
