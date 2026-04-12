import React from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useTheme } from '../../../theme';

export const FeedbackScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
      <Text style={[styles.title, { color: theme.colors.fg.default }]}>Rate Your Experience</Text>
      
      <View style={styles.stars}>
         <Text style={{ fontSize: 40 }}>⭐⭐⭐⭐⭐</Text>
      </View>

      <TextInput 
        style={[styles.input, { borderColor: theme.colors.fg.muted, color: theme.colors.fg.default }]}
        placeholder="Tell us what you liked..."
        placeholderTextColor={theme.colors.fg.muted}
        multiline
      />

      <Button title="Submit Feedback" onPress={() => navigation.popToTop()} color={theme.colors.accent.default} />
      <Text style={[styles.note, { color: theme.colors.fg.muted }]}>Your feedback helps SpeedCopy improve!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  stars: { alignItems: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  note: { marginTop: 20, textAlign: 'center', fontSize: 12 },
});
