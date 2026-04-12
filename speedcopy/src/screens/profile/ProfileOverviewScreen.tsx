import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../state_mgmt/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItemProps {
    icon: string;
    iconBg: string;
    iconColor: string;
    label: string;
    onPress: () => void;
    isLast?: boolean;
    isDanger?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    iconBg,
    iconColor,
    label,
    onPress,
    isLast = false,
    isDanger = false,
}) => {
    const { theme } = useTheme();
    return (
        <>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon as any} size={18} color={iconColor} />
                </View>
                <Text
                    style={[
                        styles.menuLabel,
                        {
                            color: isDanger ? theme.colors.status.error : theme.colors.fg.default,
                        },
                    ]}
                >
                    {label}
                </Text>
                <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.fg.muted}
                />
            </TouchableOpacity>
            {!isLast && (
                <View
                    style={[
                        styles.divider,
                        { backgroundColor: theme.colors.bg.muted },
                    ]}
                />
            )}
        </>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const ProfileOverviewScreen = ({ navigation }: any) => {
    const { theme, toggleTheme } = useTheme();
    const { user, clearAuth } = useAuthStore();
    const insets = useSafeAreaInsets();

    const isDark = theme.mode === 'dark';

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: clearAuth,
            },
        ]);
    };

    return (
        <View
            style={[
                styles.screen,
                { backgroundColor: '#F2F3F7', paddingTop: insets.top },
            ]}
        >
            {/* ── Header ──────────────────────────────────────────────── */}
            <View
                style={[
                    styles.topBar,
                    { backgroundColor: theme.colors.bg.default },
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={theme.colors.fg.default}
                    />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.colors.fg.default }]}>
                    Profile
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 32 },
                ]}
            >
                {/* ── Avatar Card ─────────────────────────────────────── */}
                <View
                    style={[
                        styles.avatarCard,
                        { backgroundColor: theme.colors.bg.default },
                    ]}
                >
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={54} color="#555" />
                    </View>
                    <Text style={[styles.userName, { color: theme.colors.fg.default }]}>
                        {user?.name || 'Guest User'}
                    </Text>
                    {user?.phone ? (
                        <Text style={[styles.userMeta, { color: theme.colors.fg.muted }]}>
                            +91-{user.phone.replace(/^\+?91/, '')}
                        </Text>
                    ) : null}
                    {user?.email ? (
                        <Text style={[styles.userMeta, { color: theme.colors.fg.muted }]}>
                            {user.email}
                        </Text>
                    ) : null}
                </View>

                {/* ── Dark Mode toggle ─────────────────────────────────── */}
                <View
                    style={[
                        styles.toggleRow,
                        { backgroundColor: theme.colors.bg.default },
                    ]}
                >
                    <Text style={[styles.toggleLabel, { color: theme.colors.fg.default }]}>
                        Enable Dark Mode
                    </Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{
                            false: '#d1d5db',
                            true: theme.colors.accent.default,
                        }}
                        thumbColor="#fff"
                    />
                </View>

                {/* ── Group 1: My Orders · Wallet · Saved Address ──────── */}
                <View
                    style={[
                        styles.menuCard,
                        { backgroundColor: theme.colors.bg.default },
                    ]}
                >
                    <MenuItem
                        icon="bag-handle-outline"
                        iconBg="#E8F0FE"
                        iconColor="#3B82F6"
                        label="My Orders"
                        onPress={() => navigation.navigate('OrderList')}
                    />
                    <MenuItem
                        icon="wallet-outline"
                        iconBg="#E6F9F0"
                        iconColor="#22C55E"
                        label="Wallet"
                        onPress={() => navigation.navigate('Wallet')}
                    />
                    <MenuItem
                        icon="location-outline"
                        iconBg="#FFF3E5"
                        iconColor="#F97316"
                        label="Saved Address"
                        onPress={() => navigation.navigate('AddressList')}
                        isLast
                    />
                </View>

                {/* ── Group 2: Refer · Notifications · Help ────────────── */}
                <View
                    style={[
                        styles.menuCard,
                        { backgroundColor: theme.colors.bg.default },
                    ]}
                >
                    <MenuItem
                        icon="gift-outline"
                        iconBg="#F3E8FF"
                        iconColor="#A855F7"
                        label="Refer & Earn"
                        onPress={() => navigation.navigate('Referrals')}
                    />
                    <MenuItem
                        icon="notifications-outline"
                        iconBg="#FFE8E8"
                        iconColor="#EF4444"
                        label="Notifications"
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        iconBg="#E6F6F5"
                        iconColor="#14B8A6"
                        label="Help & Support"
                        onPress={() => navigation.navigate('SupportTicket')}
                        isLast
                    />
                </View>

                {/* ── Group 3: Password · Delete · FAQ ─────────────────── */}
                <View
                    style={[
                        styles.menuCard,
                        { backgroundColor: theme.colors.bg.default },
                    ]}
                >
                    <MenuItem
                        icon="key-outline"
                        iconBg="#E6F6F5"
                        iconColor="#14B8A6"
                        label="Change Password"
                        onPress={() => {}}
                    />
                    <MenuItem
                        icon="trash-outline"
                        iconBg="#FFE8E8"
                        iconColor="#EF4444"
                        label="Delete my account"
                        onPress={() =>
                            Alert.alert(
                                'Delete Account',
                                'This action is irreversible. Please contact support to delete your account.',
                                [{ text: 'OK' }],
                            )
                        }
                        isDanger
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        iconBg="#E6F6F5"
                        iconColor="#14B8A6"
                        label="FAQ's"
                        onPress={() => navigation.navigate('FAQ')}
                        isLast
                    />
                </View>

                {/* ── Logout Button ────────────────────────────────────── */}
                <TouchableOpacity
                    style={[
                        styles.logoutButton,
                        {
                            backgroundColor: theme.colors.bg.default,
                            borderColor: theme.colors.fg.muted,
                        },
                    ]}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={20}
                        color={theme.colors.fg.default}
                        style={{ marginRight: 8 }}
                    />
                    <Text
                        style={[styles.logoutText, { color: theme.colors.fg.default }]}
                    >
                        Logout
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F2F3F7',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    topBarTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 12,
    },

    // ── Avatar ────────────────────────────────────────────────────────────────
    avatarCard: {
        borderRadius: 16,
        paddingVertical: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    userMeta: {
        fontSize: 13,
        marginTop: 2,
    },

    // ── Dark-mode toggle ──────────────────────────────────────────────────────
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '500',
    },

    // ── Menu Cards ────────────────────────────────────────────────────────────
    menuCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 68,
        marginRight: 18,
    },

    // ── Logout ────────────────────────────────────────────────────────────────
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 16,
        borderWidth: 1.5,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
