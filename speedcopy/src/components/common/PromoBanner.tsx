import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  subtitleHighlight?: string;
  description: string;
  imageUri: string;
  backgroundColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  title,
  subtitle,
  subtitleHighlight,
  description,
  imageUri,
  backgroundColor,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const bgColor = backgroundColor || theme.colors.accent.default;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: bgColor }, style]} 
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Left Side: Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Right Side: Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>{subtitle} </Text>
            {!!subtitleHighlight && (
              <Text style={[styles.subtitle, { color: '#fbbf24' }]}>{subtitleHighlight}</Text>
            )}
          </View>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Shop Now</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1.5,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: '#e2e8f0',
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 14,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#60a5fa',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
