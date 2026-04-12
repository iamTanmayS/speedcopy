import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { useAppStore } from '../../state_mgmt/store/appStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { mode } = useAppStore();
    
    // Animation for mode switch filling
    const fillingAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        // Trigger a 'flash' animation when mode changes
        Animated.sequence([
            Animated.timing(fillingAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(fillingAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
            }),
        ]).start();
    }, [mode]);

    const bgColor = fillingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.bg.default, '#000000'],
    });

    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
        HomeTab: 'layers-outline',
        MainActionTab: mode === 'print' ? 'print-outline' : mode === 'gift' ? 'gift-outline' : 'bag-outline',
        CartTab: 'cart-outline',
        WishlistTab: 'heart-outline',
        ProfileTab: 'person-outline',
    };

    const labels: Record<string, string> = {
        HomeTab: 'Switch',
        MainActionTab: mode === 'print' ? 'Print' : mode === 'gift' ? 'Gift' : 'Shop',
        CartTab: 'Cart',
        WishlistTab: 'Wishlist',
        ProfileTab: 'Profile',
    };

    // Check if the current focused tab wants to hide the tab bar
    const currentRoute = state.routes[state.index];
    const currentOptions = descriptors[currentRoute.key].options;
    const tabBarStyle = currentOptions.tabBarStyle as any;
    if (tabBarStyle?.display === 'none') {
        return null;
    }

    return (
        <View style={styles.outerContainer}>
            <Animated.View style={[
                styles.container, 
                { 
                    backgroundColor: bgColor,
                    marginBottom: insets.bottom + 10,
                }
            ]}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (route.name === 'HomeTab') {
                            navigation.navigate('HomeTab');
                        } else if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const textColor = fillingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [isFocused ? '#ffffff' : '#000000', '#ffffff'],
                    });

                    return (
                        <TabButton 
                            key={route.key}
                            onPress={onPress}
                            isFocused={isFocused}
                            iconName={icons[route.name]}
                            label={labels[route.name]}
                            textColor={textColor}
                        />
                    );
                })}
            </Animated.View>
        </View>
    );
};

const TabButton = ({ onPress, isFocused, iconName, label, textColor }: any) => {
    const scale = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;
    const bgAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: isFocused ? 1.05 : 1,
                friction: 5,
                tension: 40,
                useNativeDriver: false, // Prevents JS/Native crash when bridging with background color
            }),
            Animated.timing(bgAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, [isFocused]);

    const backgroundColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', '#000000']
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItemWrapper}
            activeOpacity={0.8}
        >
            <Animated.View style={[
                styles.tabItem,
                { backgroundColor, transform: [{ scale }] }
            ]}>
                <View style={styles.iconContainer}>
                    <Ionicons 
                        name={iconName} 
                        size={20} 
                        color={isFocused ? '#ffffff' : '#000000'} 
                    />
                </View>
                <Animated.Text style={[styles.label, { color: textColor }]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent', 
    },
    container: {
        flexDirection: 'row',
        paddingVertical: 5, // Reduced padding
        marginHorizontal: 16,
        borderRadius: 35,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    tabItemWrapper: {
        flex: 1,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        height: 50, // Slightly reduced height
        borderRadius: 25,
    },
    iconContainer: {
        marginBottom: 2,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
    },
});
