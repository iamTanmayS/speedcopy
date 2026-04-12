import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useMyOrdersQuery } from '../../api/order.api';
import type { Order, OrderStatus } from '../../types/order';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map a product's category/subcategory name to a badge config */
function getCategoryBadge(order: any): { label: string; icon: string; color: string; bg: string } {
    // Use the first item's product title hints or fallback
    const firstItem = order.items?.[0];
    const productName = (firstItem?.product_name || firstItem?.productName || '').toLowerCase();
    const skuName = (firstItem?.sku_name || firstItem?.skuName || '').toLowerCase();

    if (productName.includes('gift') || productName.includes('diary') || skuName.includes('gift')) {
        return { label: 'Gifiting', icon: 'gift-outline', color: '#A855F7', bg: '#F3E8FF' };
    }
    if (productName.includes('print') || productName.includes('stationary') || productName.includes('stationary')) {
        return { label: 'Printing', icon: 'print-outline', color: '#3B82F6', bg: '#EFF6FF' };
    }
    if (productName.includes('stationery') || productName.includes('diary') || productName.includes('notebook')) {
        return { label: 'Stationery', icon: 'create-outline', color: '#F97316', bg: '#FFF7ED' };
    }
    // Default: printing
    return { label: 'Printing', icon: 'print-outline', color: '#3B82F6', bg: '#EFF6FF' };
}

/** Return status badge styling */
function getStatusBadge(status: OrderStatus | string): { label: string; color: string; bg: string } {
    switch (status) {
        case 'DELIVERED':
            return { label: 'Delivered', color: '#16A34A', bg: '#DCFCE7' };
        case 'CANCELLED':
            return { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' };
        case 'OUT_FOR_DELIVERY':
            return { label: 'In Transit', color: '#F97316', bg: '#FFF7ED' };
        case 'IN_PRODUCTION':
            return { label: 'In Production', color: '#8B5CF6', bg: '#EDE9FE' };
        case 'ACCEPTED':
        case 'AWAITING_VENDOR_ACCEPTANCE':
            return { label: 'Accepted', color: '#3B82F6', bg: '#EFF6FF' };
        case 'CREATED':
        case 'CONFIRMED':
            return { label: 'Confirmed', color: '#0EA5E9', bg: '#E0F2FE' };
        case 'READY_FOR_PICKUP':
            return { label: 'Ready', color: '#10B981', bg: '#D1FAE5' };
        case 'REPRINT':
            return { label: 'Reprint', color: '#6366F1', bg: '#EEF2FF' };
        default:
            return { label: status, color: '#64748B', bg: '#F1F5F9' };
    }
}

/** Format paisa → rupees display */
function formatRupees(paisa: number): string {
    if (!paisa) return '₹0';
    return `₹${Math.round(paisa / 100)}`;
}

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
    order: any;
    onViewOrder: () => void;
    onReorder: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewOrder, onReorder }) => {
    const { theme } = useTheme();
    const categoryBadge = getCategoryBadge(order);
    const statusBadge = getStatusBadge(order.status);

    const firstItem = order.items?.[0];
    const productName = firstItem?.product_name || firstItem?.productName || 'Product';
    const skuName = firstItem?.sku_name || firstItem?.skuName || '';
    const thumbnailUrl = firstItem?.thumbnail_url || firstItem?.thumbnailUrl;

    // Build the specs line: "10 Copies • Double Sided • Spiral Bind"
    const specs: string[] = [];
    if (firstItem?.quantity) specs.push(`${firstItem.quantity} ${firstItem.quantity === 1 ? 'Copy' : 'Copies'}`);
    if (skuName) specs.push(skuName);

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.bg.default }]}>
            {/* ── Top row: Order ID + Category badge ─── */}
            <View style={styles.cardHeader}>
                <Text style={[styles.orderId, { color: theme.colors.fg.default }]}>
                    OrderID#{order.order_number || order.orderNumber || order.id?.substring(0, 5)}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: categoryBadge.bg }]}>
                    <Ionicons name={categoryBadge.icon as any} size={12} color={categoryBadge.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.categoryBadgeText, { color: categoryBadge.color }]}>
                        {categoryBadge.label}
                    </Text>
                </View>
            </View>

            {/* ── Product row: thumbnail + name + specs + status ─── */}
            <View style={styles.productRow}>
                <View style={styles.thumbWrapper}>
                    {thumbnailUrl ? (
                        <Image source={{ uri: thumbnailUrl }} style={styles.thumb} />
                    ) : (
                        <View style={[styles.thumbPlaceholder, { backgroundColor: theme.colors.bg.muted }]}>
                            <Ionicons name="image-outline" size={28} color={theme.colors.fg.muted} />
                        </View>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: theme.colors.fg.default }]} numberOfLines={1}>
                        {productName}
                    </Text>
                    {specs.length > 0 && (
                        <Text style={[styles.specText, { color: theme.colors.fg.muted }]} numberOfLines={1}>
                            {specs.join(' • ')}
                        </Text>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                            {statusBadge.label}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Divider ─── */}
            <View style={[styles.divider, { backgroundColor: theme.colors.bg.muted }]} />

            {/* ── Footer: Amount + CTAs ─── */}
            <View style={styles.cardFooter}>
                <View>
                    <Text style={[styles.amountLabel, { color: theme.colors.fg.muted }]}>Total Amount</Text>
                    <Text style={[styles.amountValue, { color: theme.colors.fg.default }]}>
                        {formatRupees(order.total_amount ?? order.totalAmount ?? 0)}
                    </Text>
                </View>

                <View style={styles.ctaRow}>
                    <TouchableOpacity
                        style={[styles.btnPrimary, { backgroundColor: theme.colors.fg.default }]}
                        onPress={onViewOrder}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.btnPrimaryText, { color: theme.colors.bg.default }]}>
                            View Order
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnOutline, { borderColor: theme.colors.fg.muted }]}
                        onPress={onReorder}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.btnOutlineText, { color: theme.colors.fg.default }]}>
                            Reorder
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyOrders = ({ theme }: any) => (
    <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.bg.muted }]}>
            <Ionicons name="receipt-outline" size={48} color={theme.colors.fg.muted} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.fg.default }]}>No Orders Yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.fg.muted }]}>
            Your orders will appear here once you place one.
        </Text>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const OrderListScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { data, isLoading, isError, refetch } = useMyOrdersQuery();

    // The API returns { orders, total } or just an array — handle both
    const orders: any[] = Array.isArray(data) ? data : (data?.orders ?? []);

    return (
        <View style={[styles.screen, { backgroundColor: '#F2F3F7', paddingTop: insets.top }]}>
            {/* ── Header ───────────────────────────────── */}
            <View style={[styles.topBar, { backgroundColor: theme.colors.bg.default }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.colors.fg.default} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.colors.fg.default }]}>
                    My Orders
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* ── Body ─────────────────────────────────── */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.accent.default} />
                </View>
            ) : isError ? (
                <View style={styles.centered}>
                    <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.fg.muted} />
                    <Text style={[styles.emptySubtitle, { color: theme.colors.fg.muted, marginTop: 12 }]}>
                        Could not load orders.
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={[styles.retryBtn, { backgroundColor: theme.colors.fg.default }]}
                    >
                        <Text style={{ color: theme.colors.bg.default, fontWeight: '600' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 32 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    ListEmptyComponent={<EmptyOrders theme={theme} />}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onViewOrder={() =>
                                navigation.navigate('TrackOrder', { orderId: item.id })
                            }
                            onReorder={() => {
                                // Navigate home so user can re-add from catalog
                                navigation.navigate('MainActionTab');
                            }}
                        />
                    )}
                />
            )}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    topBarTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Product row ───────────────────────────────────────────────────────────
    productRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
        gap: 12,
    },
    thumbWrapper: {
        width: 70,
        height: 70,
        borderRadius: 12,
        overflow: 'hidden',
    },
    thumb: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    thumbPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        flex: 1,
        paddingTop: 2,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    specText: {
        fontSize: 12,
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    divider: {
        height: StyleSheet.hairlineWidth,
        marginBottom: 14,
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amountLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    ctaRow: {
        flexDirection: 'row',
        gap: 8,
    },
    btnPrimary: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    btnPrimaryText: {
        fontSize: 13,
        fontWeight: '700',
    },
    btnOutline: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    btnOutlineText: {
        fontSize: 13,
        fontWeight: '700',
    },

    // ── Empty ─────────────────────────────────────────────────────────────────
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    retryBtn: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
});
