import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
    title, 
    onPress, 
    style, 
    textStyle, 
    disabled 
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            disabled={disabled}
            style={{ width: '100%' }}
        >
            <Animated.View style={[styles.button, style, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={[styles.text, textStyle]}>{title}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    text: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});
