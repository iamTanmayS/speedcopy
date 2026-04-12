import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity 
} from 'react-native';
import { useTheme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';

const NOTIFICATIONS = [
    { 
        id: '1', 
        title: 'Order Delivered!', 
        body: 'Your order #44512 has been delivered successfully. Rate your experience now.', 
        time: '2 hours ago',
        type: 'order',
        read: false 
    },
    { 
        id: '2', 
        title: 'Money Added', 
        body: '₹100 has been credited to your SpeedCopy wallet as referral bonus.', 
        time: '1 day ago',
        type: 'wallet',
        read: true 
    },
    { 
        id: '3', 
        title: 'Flash Sale Live!', 
        body: 'Get 50% off on all stationery items for the next 4 hours. Hurry!', 
        time: '2 days ago',
        type: 'promo',
        read: true 
    },
];

export const NotificationsScreen = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const getIcon = (type: string) => {
        switch(type) {
            case 'order': return { name: 'cube-outline', color: '#3B82F6', bg: '#E8F0FE' };
            case 'wallet': return { name: 'wallet-outline', color: '#22C55E', bg: '#E6F9F0' };
            case 'promo': return { name: 'flash-outline', color: '#F97316', bg: '#FFF3E5' };
            default: return { name: 'notifications-outline', color: '#64748B', bg: '#F1F5F9' };
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            <Header title="Notifications" />
            
            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const iconConfig = getIcon(item.type);
                    return (
                        <TouchableOpacity 
                            style={[
                                styles.notificationCard, 
                                { backgroundColor: theme.colors.bg.default },
                                !item.read && { borderLeftWidth: 4, borderLeftColor: theme.colors.accent.default }
                            ]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                                <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                            </View>
                            <View style={styles.content}>
                                <View style={styles.headerRow}>
                                    <Text style={[styles.title, { color: theme.colors.fg.default }]}>{item.title}</Text>
                                    <Text style={[styles.time, { color: theme.colors.fg.muted }]}>{item.time}</Text>
                                </View>
                                <Text style={[styles.body, { color: theme.colors.fg.muted }]} numberOfLines={2}>
                                    {item.body}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={64} color={theme.colors.fg.muted} />
                        <Text style={{ marginTop: 12, color: theme.colors.fg.muted }}>No new notifications</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    listContent: { padding: 16 },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: { flex: 1 },
    headerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 4 
    },
    title: { fontSize: 15, fontWeight: '700' },
    time: { fontSize: 11 },
    body: { fontSize: 13, lineHeight: 18 },
    empty: { marginTop: 100, alignItems: 'center' },
});
