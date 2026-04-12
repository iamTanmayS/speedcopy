import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { useTheme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const FAQS = [
    {
        question: "How do I place an order?",
        answer: "To place an order, select a category (Printing, Gifting, or Stationery) from the home screen, choose your product, customize it, and proceed to the cart for checkout."
    },
    {
        question: "What are the common delivery times?",
        answer: "Most orders are delivered within 24 hours. For express shipping, you can expect delivery within 4-6 hours depending on your city."
    },
    {
        question: "How can I track my order?",
        answer: "Go to Profile > My Orders and select the order you want to track. You will see a real-time timeline and a map view for active deliveries."
    },
    {
        question: "Can I cancel my order?",
        answer: "Orders can only be cancelled before they reach the 'Accepted' status. Once a vendor starts production, cancellations are not possible."
    },
    {
        question: "Is there a minimum order value?",
        answer: "No, there is no minimum order value, but delivery charges may apply for small orders."
    },
    {
        question: "How does the wallet work?",
        answer: "You can add money to your wallet via UPI, Cards, or Netbanking. Additionally, referral bonuses and cashbacks are directly credited to your wallet."
    }
];

const AccordionItem = ({ item, theme }: { item: typeof FAQS[0], theme: any }) => {
    const [expanded, setExpanded] = useState(false);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={[styles.faqCard, { backgroundColor: theme.colors.bg.default }]}>
            <TouchableOpacity 
                style={styles.faqHeader} 
                onPress={toggle} 
                activeOpacity={0.7}
            >
                <Text style={[styles.question, { color: theme.colors.fg.default }]}>{item.question}</Text>
                <Ionicons 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.fg.muted} 
                />
            </TouchableOpacity>
            {expanded && (
                <View style={[styles.faqBody, { borderTopWidth: 1, borderTopColor: theme.colors.bg.muted }]}>
                    <Text style={[styles.answer, { color: theme.colors.fg.muted }]}>
                        {item.answer}
                    </Text>
                </View>
            )}
        </View>
    );
};

export const FAQScreen = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            <Header title="FAQ's" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                        <Ionicons name="help-buoy-outline" size={40} color="#0EA5E9" />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.colors.fg.default }]}>How can we help you?</Text>
                    <Text style={[styles.heroSubtitle, { color: theme.colors.fg.muted }]}>
                        Search through our most frequently asked questions to find quick answers.
                    </Text>
                </View>

                {FAQS.map((item, index) => (
                    <AccordionItem key={index} item={item} theme={theme} />
                ))}

                <View style={[styles.contactCard, { backgroundColor: theme.colors.fg.default }]}>
                    <Text style={[styles.contactTitle, { color: theme.colors.bg.default }]}>Still have questions?</Text>
                    <Text style={[styles.contactDesc, { color: 'rgba(255,255,255,0.7)' }]}>
                        If you couldn't find an answer here, our support team is ready to help you 24/7.
                    </Text>
                    <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.colors.bg.default }]}>
                        <Text style={[styles.contactBtnText, { color: theme.colors.fg.default }]}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    heroSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
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
    faqCard: {
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    question: { fontSize: 15, fontWeight: '700', flex: 1, paddingRight: 10 },
    faqBody: { padding: 18 },
    answer: { fontSize: 14, lineHeight: 22 },
    contactCard: {
        borderRadius: 24,
        padding: 24,
        marginTop: 24,
        alignItems: 'center',
    },
    contactTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    contactDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    contactBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    contactBtnText: { fontWeight: '700' },
});
