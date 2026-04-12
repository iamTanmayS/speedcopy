import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useTheme } from '../../../theme';

export const OrderDetailScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { orderId } = route.params || { orderId: 'unknown' };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Order Detail #{orderId}</Text>
      
      <View style={[theme.components.card.base, styles.card]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.fg.default }]}>Timeline</Text>
        <Text style={{ color: theme.colors.status.success }}>• Order Placed (Done)</Text>
        <Text style={{ color: theme.colors.status.success }}>• Processing by SpeedCopy (Active)</Text>
        <Text style={{ color: theme.colors.fg.muted }}>• Out for Delivery</Text>
        <Text style={{ color: theme.colors.fg.muted }}>• Delivered</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Track on Map" onPress={() => navigation.navigate('LiveMap', { orderId })} color={theme.colors.accent.default} />
        <Button title="Need Help?" onPress={() => {}} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Rate Order" onPress={() => navigation.navigate('Feedback', { orderId })} color={theme.colors.status.warning} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actions: { marginBottom: 20 },
});
