import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { useWishlistQuery, useToggleWishlistMutation } from '../../api/wishlist.api';

interface FavoriteButtonProps {
  productId: string;
  style?: ViewStyle | ViewStyle[];
  iconSize?: number;
  withContainer?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  style,
  iconSize = 16,
  withContainer = true,
}) => {
  const { theme } = useTheme();
  
  const { data: wishlist } = useWishlistQuery();
  const toggleWishlist = useToggleWishlistMutation();

  const isServerFavorite = wishlist?.some(w => w.id === productId) || false;
  
  const [optimisticMode, setOptimisticMode] = useState<boolean | null>(null);

  useEffect(() => {
     // sync when server state changes
     setOptimisticMode(null);
  }, [isServerFavorite]);

  const displayFavorite = optimisticMode !== null ? optimisticMode : isServerFavorite;

  const handlePress = (e: any) => {
    e.stopPropagation?.();
    setOptimisticMode(!displayFavorite);
    toggleWishlist.mutate(productId);
  };

  const IconComponent = (
    <Ionicons
      name={displayFavorite ? 'heart' : 'heart-outline'}
      size={iconSize}
      color={displayFavorite ? theme.colors.status.error : theme.colors.fg.default}
    />
  );

  return (
    <TouchableOpacity
      style={withContainer ? [styles.heartBadge, { backgroundColor: theme.colors.bg.default }, style] : style}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {IconComponent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
