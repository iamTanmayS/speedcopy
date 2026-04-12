import React from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useTheme } from '../../../theme';

export const SupportTicketScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Help & Support</Text>
      
      <View style={[theme.components.card.base, styles.card]}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10, color: theme.colors.fg.default }}>Raise a Ticket</Text>
        <TextInput 
           style={[styles.input, { borderColor: theme.colors.fg.muted, color: theme.colors.fg.default }]}
           placeholder="Describe your issue..."
           placeholderTextColor={theme.colors.fg.muted}
           multiline
        />
        <Button title="Submit Ticket" onPress={() => navigation.popToTop()} color={theme.colors.accent.default} />
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.fg.default }]}>Active Tickets</Text>
      <View style={[theme.components.card.base, styles.ticketItem]}>
        <Text style={{ fontWeight: 'bold', color: theme.colors.fg.default }}>Ticket #987 - Delay in delivery</Text>
        <Text style={{ color: theme.colors.accent.default }}>Status: Under Review</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, marginBottom: 30 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, height: 80, textAlignVertical: 'top', marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  ticketItem: { padding: 15 },
});
