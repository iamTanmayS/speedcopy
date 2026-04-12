import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useCartStore } from '../../state_mgmt/store/cartStore';
import { Header } from '../../components/common/Header';

const { width } = Dimensions.get('window');

export const AddressListScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { savedAddresses, selectedAddress, setSelectedAddress } = useCartStore();
    
    const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedAddress?.id || null);

    const handleSave = () => {
        if (localSelectedId) {
            const addr = savedAddresses.find(a => a.id === localSelectedId);
            if (addr) setSelectedAddress(addr);
        }
        navigation.goBack();
    };

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            <Header title="Saved Addresses" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ── Status Banner ──────────────── */}
                <View style={[styles.banner, { backgroundColor: '#E8F0FE' }]}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="time-outline" size={20} color="#3B82F6" />
                    </View>
                    <View>
                        <Text style={styles.bannerLabel}>Default delivery time</Text>
                        <Text style={styles.bannerValue}>Within 24 Hours</Text>
                    </View>
                </View>

                {/* ── Address List ────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.fg.default }]}>Delivery Addresses</Text>
                    <Text style={{ color: theme.colors.fg.muted, fontSize: 13 }}>{savedAddresses.length} saved</Text>
                </View>

                {savedAddresses.map((item) => {
                    const isSelected = localSelectedId === item.id;
                    const isHome = item.label.toLowerCase() === 'home';
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.addressCard, 
                                { backgroundColor: theme.colors.bg.default },
                                isSelected && { borderColor: theme.colors.fg.default, borderWidth: 2 }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setLocalSelectedId(item.id)}
                        >
                            <View style={styles.addressHeader}>
                                <View style={styles.labelRow}>
                                    <View style={[styles.labelIcon, { backgroundColor: theme.colors.bg.muted }]}>
                                        <Ionicons name={isHome ? "home-outline" : "briefcase-outline"} size={16} color={theme.colors.fg.default} />
                                    </View>
                                    <Text style={[styles.labelText, { color: theme.colors.fg.default }]}>{item.label}</Text>
                                </View>
                                <View style={[styles.radio, isSelected && { borderColor: theme.colors.fg.default }]}>
                                    {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.colors.fg.default }]} />}
                                </View>
                            </View>
                            
                            <Text style={[styles.addressText, { color: theme.colors.fg.muted }]}>
                                {item.address}
                            </Text>
                            {item.pinCode && (
                                <Text style={[styles.pinText, { color: theme.colors.fg.muted }]}>
                                    Pin Code: {item.pinCode}
                                </Text>
                            )}

                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Text style={{ color: theme.colors.accent.default, fontWeight: '600' }}>Edit</Text>
                                </TouchableOpacity>
                                <View style={[styles.dot, { backgroundColor: theme.colors.bg.muted }]} />
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Text style={{ color: theme.colors.status.error, fontWeight: '600' }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* ── Add New ────────────────── */}
                <TouchableOpacity 
                    style={[styles.addBtn, { borderColor: theme.colors.bg.muted }]}
                    onPress={() => navigation.navigate('AddNewAddress')}
                >
                    <Ionicons name="add" size={24} color={theme.colors.fg.muted} />
                    <Text style={[styles.addText, { color: theme.colors.fg.muted }]}>Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ── Sticky Bottom ────────────── */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.colors.fg.default }]} onPress={handleSave}>
                    <Text style={{ color: theme.colors.bg.default, fontWeight: '700', fontSize: 16 }}>Set as Default</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 16,
        marginBottom: 24,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerLabel: { fontSize: 12, opacity: 0.7, marginBottom: 2 },
    bannerValue: { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    addressCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    labelIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    labelText: { fontSize: 16, fontWeight: '700' },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioDot: { width: 12, height: 12, borderRadius: 6 },
    addressText: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
    pinText: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actionBtn: { paddingVertical: 4 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 8,
    },
    addText: { fontSize: 16, fontWeight: '600' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(242, 243, 247, 0.95)',
    },
    mainBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
