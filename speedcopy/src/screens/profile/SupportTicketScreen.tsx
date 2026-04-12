import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useTheme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';

export const SupportTicketScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [issue, setIssue] = useState('');

    const handleSubmit = () => {
        // Mock submission
        if (!issue.trim()) return;
        navigation.goBack();
    };

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            <Header title="Help & Support" />
            
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FCE7F3' }]}>
                            <Ionicons name="chatbubbles-outline" size={40} color="#DB2777" />
                        </View>
                        <Text style={[styles.heroTitle, { color: theme.colors.fg.default }]}>We're Here to Help</Text>
                        <Text style={[styles.heroSubtitle, { color: theme.colors.fg.muted }]}>
                            Describe your issue below and our support team will get back to you as soon as possible.
                        </Text>
                    </View>

                    {/* New Ticket Form */}
                    <View style={[styles.card, { backgroundColor: theme.colors.bg.default }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.fg.default }]}>Raise a Ticket</Text>
                        
                        <View style={[styles.inputContainer, { borderColor: theme.colors.bg.muted, backgroundColor: theme.colors.bg.muted }]}>
                            <TextInput 
                                style={[styles.input, { color: theme.colors.fg.default }]}
                                placeholder="Describe your issue in detail..."
                                placeholderTextColor={theme.colors.fg.muted}
                                multiline
                                value={issue}
                                onChangeText={setIssue}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitButton, { backgroundColor: theme.colors.accent.default, opacity: issue.trim() ? 1 : 0.6 }]} 
                            onPress={handleSubmit}
                            disabled={!issue.trim()}
                        >
                            <Text style={styles.submitButtonText}>Submit Ticket</Text>
                            <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Active Tickets Section */}
                    <Text style={[styles.sectionHeading, { color: theme.colors.fg.default }]}>Recent Tickets</Text>
                    
                    <View style={[styles.ticketCard, { backgroundColor: theme.colors.bg.default }]}>
                        <View style={styles.ticketHeader}>
                            <Text style={[styles.ticketId, { color: theme.colors.fg.default }]}>Ticket #987</Text>
                            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                                <Text style={[styles.badgeText, { color: '#D97706' }]}>Under Review</Text>
                            </View>
                        </View>
                        <Text style={[styles.ticketSubject, { color: theme.colors.fg.default }]}>Delay in delivery for Order #12344</Text>
                        <View style={styles.ticketFooter}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.fg.muted} />
                            <Text style={[styles.ticketDate, { color: theme.colors.fg.muted }]}>Opened 2 hours ago</Text>
                        </View>
                    </View>
                    
                    <View style={[styles.ticketCard, { backgroundColor: theme.colors.bg.default }]}>
                        <View style={styles.ticketHeader}>
                            <Text style={[styles.ticketId, { color: theme.colors.fg.default }]}>Ticket #842</Text>
                            <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                                <Text style={[styles.badgeText, { color: '#059669' }]}>Resolved</Text>
                            </View>
                        </View>
                        <Text style={[styles.ticketSubject, { color: theme.colors.fg.default }]}>Refund for damaged product in Order #11059</Text>
                        <View style={styles.ticketFooter}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.fg.muted} />
                            <Text style={[styles.ticketDate, { color: theme.colors.fg.muted }]}>Resolved on Oct 24th</Text>
                        </View>
                    </View>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { padding: 20 },
    heroSection: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 20,
        minHeight: 120,
        padding: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        textAlignVertical: 'top',
        lineHeight: 22,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },

    sectionHeading: { fontSize: 18, fontWeight: '700', marginBottom: 16, paddingLeft: 4 },
    ticketCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#0EA5E9',
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketId: { fontSize: 14, fontWeight: '700' },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: { fontSize: 12, fontWeight: '700' },
    ticketSubject: { fontSize: 15, fontWeight: '500', marginBottom: 12, lineHeight: 20 },
    ticketFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ticketDate: { fontSize: 13, marginLeft: 6 },
    bottomSpacer: { height: 40 },
});
