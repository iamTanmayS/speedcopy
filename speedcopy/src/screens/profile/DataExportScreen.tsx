import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useTheme } from '../../../theme';

export const DataExportScreen = () => {
  const { theme } = useTheme();

  const handleRequest = () => {
    Alert.alert('Request Sent', 'Your personal data will be emailed to you within 48 hours.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Privacy & Transparency</Text>
      
      <View style={[theme.components.card.base, styles.card]}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20, color: theme.colors.fg.default }}>
          You have the right to export your personal data stored on SpeedCopy.
        </Text>
        <Button title="Request Data Export" onPress={handleRequest} color={theme.colors.accent.default} />
      </View>

      <Text style={[styles.title, { color: theme.colors.status.error, marginTop: 40 }]}>Danger Zone</Text>
       <View style={[theme.components.card.base, styles.card]}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20, color: theme.colors.fg.default }}>
          Closing your account is permanent. This cannot be undone if you have active orders.
        </Text>
        <Button title="Request Account Deletion" onPress={() => {}} color={theme.colors.status.error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 20, alignItems: 'center' },
});
