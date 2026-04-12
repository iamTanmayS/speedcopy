import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Share,
    Image,
    Dimensions
} from 'react-native';
import { useTheme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';

const { width } = Dimensions.get('window');

export const ReferralsScreen = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const referralCode = "SPEED2026";

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Get 20% off on your first order with SpeedCopy! Use my code: ${referralCode}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            <Header title="Refer & Earn" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ── Illustration / Hero ──────────────── */}
                <View style={styles.heroSection}>
                    <View style={[styles.illustrationBox, { backgroundColor: '#F3E8FF' }]}>
                        <Ionicons name="gift-outline" size={80} color="#A855F7" />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.colors.fg.default }]}>Refer Friends & Earn</Text>
                    <Text style={[styles.heroSubtitle, { color: theme.colors.fg.muted }]}>
                        Share your code and get ₹100 for every friend who places their first order.
                    </Text>
                </View>

                {/* ── Referral Code Card ────────────────── */}
                <View style={[styles.codeCard, { backgroundColor: theme.colors.bg.default }]}>
                    <Text style={[styles.codeLabel, { color: theme.colors.fg.muted }]}>Your Referral Code</Text>
                    <View style={[styles.codeBox, { backgroundColor: theme.colors.bg.muted }]}>
                        <Text style={[styles.codeText, { color: theme.colors.fg.default }]}>{referralCode}</Text>
                        <TouchableOpacity onPress={handleShare}>
                            <Ionicons name="copy-outline" size={20} color={theme.colors.accent.default} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity 
                        style={[styles.shareBtn, { backgroundColor: theme.colors.fg.default }]}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social-outline" size={20} color={theme.colors.bg.default} />
                        <Text style={[styles.shareBtnText, { color: theme.colors.bg.default }]}>Share Invite Link</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Stats Section ─────────────────────── */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.bg.default }]}>
                        <Text style={[styles.statValue, { color: theme.colors.fg.default }]}>12</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.fg.muted }]}>Total Refers</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.bg.default }]}>
                        <Text style={[styles.statValue, { color: theme.colors.status.success }]}>₹1,200</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.fg.muted }]}>Total Earned</Text>
                    </View>
                </View>

                {/* ── How it works ─────────────────────── */}
                <Text style={[styles.sectionTitle, { color: theme.colors.fg.default }]}>How it works</Text>
                
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: '#E8F0FE' }]}>
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>1</Text>
                    </View>
                    <View style={styles.stepInfo}>
                        <Text style={[styles.stepTitle, { color: theme.colors.fg.default }]}>Invite your friends</Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.fg.muted }]}>Share your unique link or code via WhatsApp or Social Media.</Text>
                    </View>
                </View>

                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: '#E6F9F0' }]}>
                        <Text style={{ color: '#22C55E', fontWeight: 'bold' }}>2</Text>
                    </View>
                    <View style={styles.stepInfo}>
                        <Text style={[styles.stepTitle, { color: theme.colors.fg.default }]}>They make a purchase</Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.fg.muted }]}>Your friend uses the code to get a discount on their first order.</Text>
                    </View>
                </View>

                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: '#FFF3E5' }]}>
                        <Text style={{ color: '#F97316', fontWeight: 'bold' }}>3</Text>
                    </View>
                    <View style={styles.stepInfo}>
                        <Text style={[styles.stepTitle, { color: theme.colors.fg.default }]}>You get rewarded</Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.fg.muted }]}>Once their order is delivered, ₹100 is credited to your wallet.</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    heroSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    illustrationBox: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
    heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    codeCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    codeLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    codeText: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    shareBtnText: { fontSize: 16, fontWeight: '700' },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
    stepRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    stepDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    stepInfo: { flex: 1 },
    stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    stepDesc: { fontSize: 13, lineHeight: 18 },
});
