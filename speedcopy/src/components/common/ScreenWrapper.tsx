import React from 'react';
import { View, StyleSheet, ScrollView, Text, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    fixedHeader?: React.ReactNode;
    scrollable?: boolean;
    edges?: Edge[];
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    showFooter?: boolean;
    backgroundColor?: string;
    withBottomNavPadding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    fixedHeader,
    scrollable = true,
    edges = ['top', 'left', 'right'],
    style,
    contentContainerStyle,
    showFooter = true,
    backgroundColor,
    withBottomNavPadding = true,
}) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const bgColor = backgroundColor || theme.colors.bg.default;

    const Footer = () => {
        if (!showFooter) return null;
        return (
            <View style={styles.footerContainer}>
                <Text style={[styles.footerText, { color: theme.colors.fg.muted }]}>Made with </Text>
                <Ionicons name="heart" size={14} color={theme.colors.status.error} style={styles.heartIcon} />
                <Text style={[styles.footerText, { color: theme.colors.fg.muted }]}> by Tanmay</Text>
            </View>
        );
    };

    if (scrollable) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bgColor }, style]} edges={edges}>
                {fixedHeader}
                <ScrollView 
                    contentContainerStyle={[
                        styles.scrollContent, 
                        withBottomNavPadding && { paddingBottom: insets.bottom + 100 }, 
                        contentContainerStyle
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                    <Footer />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }, style]} edges={edges}>
            {fixedHeader}
            <View style={[styles.nonScrollContent, contentContainerStyle]}>
                {children}
            </View>
            <Footer />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    nonScrollContent: {
        flex: 1,
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        marginTop: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#9ca3af',
        fontWeight: '500',
    },
    heartIcon: {
        marginHorizontal: 4,
    }
});
