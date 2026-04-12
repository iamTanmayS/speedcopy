import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../../theme';
import { AnimatedButton } from '../../components/animations/AnimatedButton';
import { AnimatedInput } from '../../components/animations/AnimatedInput';
import { useVerifyOTP } from '../../api/hooks/useAuth';

export const OTPScreen = ({ navigation, route }: any) => {
  const [otp, setOtp] = useState('');
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { mutate: verifyOTP, isPending } = useVerifyOTP();
  
  // Safely fallback email if navigated directly or without params
  const { email } = route.params || { email: '' };

  const handleVerify = () => {
    if (otp.length < 4 || !email) return;

    verifyOTP(
        { email, otp },
        {
            onSuccess: () => {
                // The hook will update Zustand authStore.
                // Navigation will happen naturally via MainTabNavigator vs AuthStack listening to auth state.
                // Or you could manually navigate here if not mapped yet:
                // navigation.replace('ProfileSetup');
            },
            onError: (error: any) => {
                Alert.alert('Verification Failed', error?.response?.data?.error?.message || 'Invalid code. Please try again.');
            }
        }
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.fg.default} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            Please enter the authentication code we sent to {'\n'}
            <Text style={{ fontWeight: '600', color: theme.colors.fg.default }}>
              {email || 'your email'}
            </Text>
          </Text>
        </View>

        <View style={styles.formContainer}>
          <AnimatedInput

            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            containerStyle={styles.inputContainer}
            style={styles.otpInput}
          />
          <AnimatedButton
            title={isPending ? "Verifying..." : "Verify & Continue"}
            onPress={handleVerify}
            disabled={otp.length < 4 || isPending}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive a code? </Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
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
  inputContainer: {
    marginBottom: 24,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: theme.colors.fg.muted,
    fontSize: 14,
  },
  resendLink: {
    color: theme.colors.fg.default,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
