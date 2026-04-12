import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity,
    Dimensions,
    ScrollView
} from 'react-native';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TRANSACTIONS = [
    { id: '1', title: 'Referral Bonus', date: 'Oct 01, 2026', amount: 10000, type: 'credit' },
    { id: '2', title: 'Order #44512', date: 'Oct 05, 2026', amount: 5000, type: 'debit' },
    { id: '3', title: 'Cashback Received', date: 'Sep 28, 2026', amount: 2500, type: 'credit' },
    { id: '4', title: 'Order #44498', date: 'Sep 25, 2026', amount: 12000, type: 'debit' },
];

export const WalletScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const renderTransaction = ({ item }: { item: typeof TRANSACTIONS[0] }) => (
        <View style={[styles.transactionCard, { backgroundColor: theme.colors.bg.default }]}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'credit' ? '#E6F9F0' : '#FFF3E5' }]}>
                <Ionicons 
                    name={item.type === 'credit' ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} 
                    size={24} 
                    color={item.type === 'credit' ? theme.colors.status.success : theme.colors.status.warning} 
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={[styles.transactionTitle, { color: theme.colors.fg.default }]}>{item.title}</Text>
                <Text style={[styles.transactionDate, { color: theme.colors.fg.muted }]}>{item.date}</Text>
            </View>
            <Text style={[
                styles.transactionAmount, 
                { color: item.type === 'credit' ? theme.colors.status.success : theme.colors.fg.default }
            ]}>
                {item.type === 'credit' ? '+' : '-'}₹{item.amount / 100}
            </Text>
        </View>
    );

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            <Header title="My Wallet" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ── Balance Card ─────────────────────── */}
                <View style={[styles.balanceCard, { backgroundColor: theme.colors.fg.default }]}>
                    <Text style={[styles.balanceLabel, { color: theme.colors.bg.default }]}>Total Balance</Text>
                    <Text style={[styles.balanceAmount, { color: theme.colors.bg.default }]}>₹150.00</Text>
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.walletBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="add-circle-outline" size={20} color="#fff" />
                            <Text style={styles.walletBtnText}>Add Money</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.walletBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="gift-outline" size={20} color="#fff" />
                            <Text style={styles.walletBtnText}>Reedem</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Transactions Section ──────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.fg.default }]}>Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text style={{ color: theme.colors.accent.default, fontWeight: '600' }}>View All</Text>
                    </TouchableOpacity>
                </View>

                {TRANSACTIONS.map(item => (
                    <View key={item.id} style={{ marginBottom: 12 }}>
                        {renderTransaction({ item })}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { padding: 20 },
    balanceCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    balanceLabel: { fontSize: 14, opacity: 0.8, marginBottom: 8 },
    balanceAmount: { fontSize: 36, fontWeight: '800', marginBottom: 24 },
    actionRow: { flexDirection: 'row', gap: 12 },
    walletBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    walletBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
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
    transactionInfo: { flex: 1 },
    transactionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    transactionDate: { fontSize: 12 },
    transactionAmount: { fontSize: 16, fontWeight: '800' },
});
