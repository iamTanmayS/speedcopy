import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedButton } from '../../components/animations/AnimatedButton';
import { AnimatedInput } from '../../components/animations/AnimatedInput';
import { useTheme, Theme } from '../../../theme';
import { useRequestOTP } from '../../api/hooks/useAuth';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { mutate: requestOTP, isPending } = useRequestOTP();

  const handleSendOTP = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    requestOTP(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          navigation.navigate('OTP', { email: trimmedEmail });
        },
        onError: (error: any) => {

          Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to send OTP.');
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
          <Text style={styles.welcomeText}>Welcome To</Text>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Enter your email address to sign in or create an account.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <AnimatedInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
          />
          <AnimatedButton
            title={isPending ? "Sending..." : "Send OTP"}
            onPress={handleSendOTP}
            disabled={!email || isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.muted, // Using theme muted background
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.fg.muted,
    marginBottom: 8,
  },
  logo: {
    width: 220,
    height: 44,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.fg.muted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
});
