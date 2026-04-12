import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme, Theme } from '../../../theme';
import { AnimatedButton } from '../../components/animations/AnimatedButton';
import { AnimatedInput } from '../../components/animations/AnimatedInput';
import { useUpdateProfile } from '../../api/hooks/useUser';

export const ProfileSetupScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleComplete = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();

    if (!trimmedName || !trimmedPhone || !trimmedCity) {
      Alert.alert('Incomplete Profile', 'Please fill in all the details to continue.');
      return;
    }

    updateProfile(
      {
        name: trimmedName,
        phone: trimmedPhone,
        city: trimmedCity,
      },
      {
        onSuccess: () => {
          Alert.alert('Profile Complete', 'Your profile has been updated successfully!');
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to update profile. Please try again.');
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Just a few more details to set up your account.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <AnimatedInput 
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
          />
          
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <AnimatedInput 
            placeholder="e.g. +91 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.inputLabel}>City</Text>
          <AnimatedInput 
            placeholder="e.g. Mumbai"
            value={city}
            onChangeText={setCity}
            containerStyle={styles.inputContainer}
          />

          <AnimatedButton 
            title={isPending ? "Saving..." : "Complete Setup"} 
            onPress={handleComplete} 
            disabled={!name || !phone || !city || isPending}
            style={{ marginTop: 12 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.muted,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.fg.default,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.fg.muted,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.fg.default,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
});
