import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { FavoriteButton } from './FavoriteButton';
import { useTheme } from '../../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 42) / 2; // 16 padding each side + 10 gap

interface ProductCardProduct {
  id: string;
  title: string;
  basePrice: number;
  currency: string;
  mrp?: number;
  discountTag?: string;
  imageUrl: string;
  isTrending?: boolean;
  isFavorite?: boolean;
}

interface ProductCardProps {
  product: ProductCardProduct;
  onPress?: () => void;
  onLikePress?: () => void;
  width?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onLikePress,
  width: customWidth,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card, 
        { backgroundColor: theme.colors.bg.default },
        customWidth ? { width: customWidth } : null
      ]}
    >
      {/* Image section */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />

        {/* Heart badge — top right corner */}
        <FavoriteButton
          productId={product.id}
          style={styles.absoluteBadge}
        />
      </View>

      {/* Info section */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.colors.fg.default }]} numberOfLines={1}>
          {product.title}
        </Text>

        {/* Price row: ₹350  MRP ₹450  [30% OFF] */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.colors.fg.default }]}>
            {product.currency}
            {product.basePrice}
          </Text>

          {!!product.mrp && (
            <Text style={[styles.mrp, { color: theme.colors.fg.muted }]}>
              {' '}MRP {product.currency}
              {product.mrp}
            </Text>
          )}

          {!!product.discountTag && (
            <View style={[styles.discountPill, { backgroundColor: theme.colors.status.success }]}>
              <Text style={styles.discountText}>{product.discountTag}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  absoluteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  info: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  mrp: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: '#22c55e',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
