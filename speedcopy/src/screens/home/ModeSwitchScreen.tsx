import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../../../theme';
import { useAppStore, AppMode } from '../../state_mgmt/store/appStore';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView,  useSafeAreaInsets  } from 'react-native-safe-area-context';

export const ModeSwitchScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { setMode } = useAppStore();
    const insets = useSafeAreaInsets();

    const handleModeSelect = (mode: AppMode) => {
        setMode(mode);
        navigation.navigate('MainActionTab');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bg.default }]}>
            {/* Custom Header Area avoiding safe area */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerLeft}>
                    <Image source={require('../../../assets/logo.png')} style={styles.topLogo} resizeMode="contain" />
                </View>
                <TouchableOpacity style={styles.referButton}>
                    <Ionicons name="gift-outline" size={16} color="#fff" />
                    <Text style={styles.referText}>Refer</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleSection}>
                    <Text style={[styles.mainTitle, { color: theme.colors.fg.default }]}>
                        What Do you want today ?
                    </Text>
                    <Text style={styles.subtitle}>
                        Select a service to get started.
                    </Text>
                </View>

                {/* Printing Card */}
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    style={[styles.card, { backgroundColor: '#457b9d' }]}
                    onPress={() => handleModeSelect('print')}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Printing</Text>
                            <Text style={styles.cardSubtitle}>Documents, Flyers & Business Cards</Text>
                        </View>
                        <Image 
                            source={require('../../../assets/printing.png')} 
                            style={styles.cardImage}
                        />
                    </View>
                </TouchableOpacity>

                {/* Gifting Card */}
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    style={[styles.card, { backgroundColor: '#ff7aa2' }]}
                    onPress={() => handleModeSelect('gift')}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Gifting</Text>
                            <Text style={styles.cardSubtitle}>Personalized mugs, Cushions & Frames</Text>
                        </View>
                        <Image 
                            source={require('../../../assets/gifting.png')} 
                            style={styles.cardImage}
                        />
                    </View>
                </TouchableOpacity>

                {/* Shopping Card */}
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    style={[styles.card, { backgroundColor: '#aa7bc9' }]}
                    onPress={() => handleModeSelect('shopping')}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Shopping</Text>
                            <Text style={styles.cardSubtitle}>Stationery, Books & Office Supplies</Text>
                        </View>
                        <Image 
                            source={require('../../../assets/shopping.png')} 
                            style={styles.cardImage}
                        />
                    </View>
                </TouchableOpacity>

                {/* Bottom Spacer for Tab Bar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topLogo: {
        width: 140,
        height: 35,
    },
    referButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff4757',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#ff4757',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    referText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 13,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    card: {
        width: '100%',
        height: 140,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1.2,
        padding: 20,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 18,
    },
    cardImage: {
        width: 130, // Give graphics slightly more room
        height: 120, // Slightly square height to keep aspect ratio of graphics
        resizeMode: 'contain',
        marginRight: 10,
    },
});
