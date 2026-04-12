import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { useTheme } from '../../../theme';

export const PreviewLockScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Final Approval</Text>
      <View style={[styles.previewFrame, { borderColor: theme.colors.accent.default }]}>
         <Text style={{ color: theme.colors.fg.muted }}>[ Final Design Preview ]</Text>
      </View>
      <Text style={[styles.warning, { color: theme.colors.status.error }]}> Designs are locked after approval. No further edits allowed.</Text>
      
      <View style={styles.actions}>
        <Button title="Back to Editor" onPress={() => navigation.goBack()} color={theme.colors.fg.muted} />
        <Button title="Approve & Go to Cart" onPress={() => navigation.navigate('Cart')} color={theme.colors.status.success} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  previewFrame: { width: '100%', height: 300, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  warning: { textAlign: 'center', marginBottom: 30, fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
});
