import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CarouselImage {
  uri: string;
  key: string;
}

interface ProductImageCarouselProps {
  images: CarouselImage[];
  topRightElement?: React.ReactNode;
  height?: number;
  accentColor?: string;
}

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  topRightElement,
  height = 280,
  accentColor = '#e91e8c',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  return (
    <View style={styles.container}>
      {/* Main hero image */}
      <View style={[styles.heroWrapper, { height }]}>
        <Image
          source={{ uri: images[activeIndex].uri }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Top-right slot (e.g. FavoriteButton) */}
        {topRightElement && (
          <View style={styles.topRightSlot}>{topRightElement}</View>
        )}
        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex
                    ? [styles.dotActive, { backgroundColor: accentColor }]
                    : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailStrip}
        >
          {images.map((img, idx) => (
            <TouchableOpacity
              key={img.key}
              onPress={() => setActiveIndex(idx)}
              activeOpacity={0.8}
              style={[
                styles.thumbnailWrap,
                idx === activeIndex && [styles.thumbnailActive, { borderColor: accentColor }],
              ]}
            >
              <Image source={{ uri: img.uri }} style={styles.thumbnailImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  heroWrapper: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topRightSlot: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: 4,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },
  thumbnailStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  thumbnailWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  thumbnailActive: {
    borderWidth: 2.5,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
});
