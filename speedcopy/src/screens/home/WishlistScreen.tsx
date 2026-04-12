import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { useTheme } from '../../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { ProductCard } from '../../components/common/ProductCard';
import { useWishlistQuery, useToggleWishlistMutation } from '../../api/wishlist.api';
import { useCatalogQuery } from '../../api/catalog.api';
import { useAuthStore } from '../../state_mgmt/store/authStore';
import { getProductRouteParams } from '../../utils/productNavigation';
import { Ionicons } from '@expo/vector-icons';

export const WishlistScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { data: catalog } = useCatalogQuery();
    const { data: wishlist, isLoading, isError, refetch } = useWishlistQuery();
    const toggleWishlist = useToggleWishlistMutation();

    const handleProductPress = (productId: string) => {
        const product = wishlist?.find(p => p.id === productId);
        if (!product || !catalog) return;

        const routeParams = getProductRouteParams(product, catalog);
        if (routeParams) {
            // Navigate into the HomeStack (nested inside the MainActionTab)
            navigation.navigate('MainActionTab', {
                screen: routeParams.screen,
                params: routeParams.params,
            });
        }
    };

    const handleToggleWishlist = (productId: string) => {
        toggleWishlist.mutate(productId);
    };

    // ── Not authenticated ─────────────────────────────────────────────────────
    if (!isAuthenticated && !isLoading) {
        return (
            <ScreenWrapper fixedHeader={
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>My Wishlist</Text>
                </View>
            }>
                <View style={styles.emptyContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.bg.muted }]}>
                        <Ionicons name="lock-closed-outline" size={48} color={theme.colors.fg.muted} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.fg.default }]}>Sign In Required</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.fg.muted }]}>
                        Please sign in to view your saved items.
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <ScreenWrapper fixedHeader={
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>My Wishlist</Text>
                </View>
            }>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.accent.default} />
                </View>
            </ScreenWrapper>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (isError) {
        return (
            <ScreenWrapper fixedHeader={
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>My Wishlist</Text>
                </View>
            }>
                <View style={styles.center}>
                    <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.fg.muted} />
                    <Text style={[styles.emptySubtitle, { color: theme.colors.fg.muted, marginTop: 12 }]}>
                        Could not load wishlist.
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={[styles.retryButton, { backgroundColor: theme.colors.accent.default }]}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    // ── Empty ─────────────────────────────────────────────────────────────────
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.bg.muted }]}>
                <Ionicons name="heart-outline" size={48} color={theme.colors.fg.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.fg.default }]}>Your Wishlist is Empty</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.fg.muted }]}>
                Tap the ♥ on any product to save it here.
            </Text>
            <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: theme.colors.fg.default }]}
                onPress={() => navigation.navigate('MainActionTab')}
            >
                <Text style={{ color: theme.colors.bg.default, fontWeight: 'bold' }}>Explore Products</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenWrapper
            scrollable={false}
            fixedHeader={
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.fg.default }]}>My Wishlist</Text>
                    {wishlist && wishlist.length > 0 && (
                        <Text style={[styles.headerCount, { color: theme.colors.fg.muted }]}>
                            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
                        </Text>
                    )}
                </View>
            }
        >
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={[styles.listContent, wishlist?.length === 0 && styles.listEmpty]}
                renderItem={({ item }) => (
                    <ProductCard
                        product={{
                            id: item.id,
                            title: item.title,
                            basePrice: item.startingPrice ?? 0,
                            currency: '₹',
                            imageUrl: item.thumbnailUrl
                                ? item.thumbnailUrl
                                : `https://picsum.photos/seed/${item.slug}/300/200`,
                            isFavorite: true,
                        }}
                        onPress={() => handleProductPress(item.id)}
                        onLikePress={() => handleToggleWishlist(item.id)}
                    />
                )}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerCount: { fontSize: 13 },
    listContent: { padding: 16 },
    listEmpty: { flexGrow: 1 },
    row: { justifyContent: 'space-between', marginBottom: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, marginBottom: 30 },
    exploreButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    retryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
});
