import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { useCartStore } from '../../state_mgmt/store/cartStore';

export const AddNewAddressScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addAddress, setSelectedAddress } = useCartStore();

  const [label, setLabel] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pinCode, setPinCode] = useState('');

  const handleSave = () => {
    if (!label.trim() || !addressLine.trim() || !pinCode.trim()) {
      return; // Basic validation
    }

    const newAddress = {
      id: Math.random().toString(36).substr(2, 9),
      label: label.trim(),
      address: addressLine.trim(),
      pinCode: pinCode.trim(),
    };

    addAddress(newAddress);
    setSelectedAddress(newAddress); // Auto-select the newly added address
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScreenWrapper
        backgroundColor="#f8fafc"
        fixedHeader={<Header title="Add New Address" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showFooter={false}
        withBottomNavPadding={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionSubheading}>Enter your delivery details.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Save Address As</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Home, Office, Friend's Place"
              placeholderTextColor="#94a3b8"
              value={label}
              onChangeText={setLabel}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Complete Address</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Flat / House no. / Floor / Building..."
              placeholderTextColor="#94a3b8"
              value={addressLine}
              onChangeText={setAddressLine}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pin Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 560034"
              placeholderTextColor="#94a3b8"
              value={pinCode}
              onChangeText={setPinCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>
      </ScreenWrapper>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={[styles.saveButton, (!label || !addressLine || !pinCode) && styles.saveButtonDisabled]} 
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={!label || !addressLine || !pinCode}
        >
          <Text style={styles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionSubheading: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#f8fafc',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
