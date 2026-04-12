import React, { useRef, useState } from 'react';
import { View, TextInput, Animated, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface AnimatedInputProps extends TextInputProps {
    containerStyle?: ViewStyle | ViewStyle[];
    activeBorderColor?: string;
    inactiveBorderColor?: string;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({ 
    containerStyle, 
    activeBorderColor = '#000', 
    inactiveBorderColor = '#ccc',
    onFocus,
    onBlur,
    ...props 
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false, // Animating border color
        }).start();
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        if (onBlur) onBlur(e);
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveBorderColor, activeBorderColor]
    });

    return (
        <Animated.View style={[
            styles.container, 
            containerStyle, 
            { borderColor }
        ]}>
            <TextInput
                {...props}
                style={[styles.input, props.style]}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholderTextColor="#a0aec0"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    input: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        width: '100%',
    },
});
