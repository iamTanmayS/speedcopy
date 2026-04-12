import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';

export const DeliveryModeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Delivery Mode</Text>
      
      <TouchableOpacity style={[theme.components.card.base, styles.option]}>
        <Text style={{ fontWeight: 'bold', color: theme.colors.fg.default }}>Fast Delivery</Text>
        <Text style={{ color: theme.colors.fg.muted }}>Delivered within 4-6 hours</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[theme.components.card.base, styles.option]}>
        <Text style={{ fontWeight: 'bold', color: theme.colors.fg.default }}>Standard Delivery</Text>
        <Text style={{ color: theme.colors.fg.muted }}>Delivered by tomorrow</Text>
      </TouchableOpacity>

      <Button title="Continue to Checkout" onPress={() => navigation.navigate('Checkout')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  option: { marginBottom: 15, padding: 15 },
});
