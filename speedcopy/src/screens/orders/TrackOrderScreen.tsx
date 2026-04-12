import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderDetailsQuery, OrderDetailExtended } from '../../api/order.api';
import type { OrderStatus } from '../../types/order';
import { format } from 'date-fns';

// ─── Status-to-timeline mapping ─────────────────────────────────────────────
const STATUS_ORDER: OrderStatus[] = [
    'CREATED',
    'AWAITING_VENDOR_ACCEPTANCE',
    'ACCEPTED',
    'IN_PRODUCTION',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
];

interface TimelineConfig {
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    /** which DB statuses count as "this step reached" */
    matchStatuses: OrderStatus[];
}

const TIMELINE: TimelineConfig[] = [
    {
        label: 'Order Confirmed',
        description: "We've received your request",
        icon: 'checkmark',
        matchStatuses: ['CREATED', 'AWAITING_VENDOR_ACCEPTANCE', 'ACCEPTED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    },
    {
        label: 'Printing',
        description: 'Quality Check Completed',
        icon: 'print-outline',
        matchStatuses: ['IN_PRODUCTION', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    },
    {
        label: 'Out for delivery',
        description: 'In Progress',
        icon: 'bicycle-outline',
        matchStatuses: ['OUT_FOR_DELIVERY', 'DELIVERED'],
    },
    {
        label: 'Delivered',
        description: 'Package received',
        icon: 'cube-outline',
        matchStatuses: ['DELIVERED'],
    },
];

type StepStatus = 'completed' | 'current' | 'upcoming';

function resolveStepStatus(config: TimelineConfig, order: OrderDetailExtended): StepStatus {
    const currentIdx = STATUS_ORDER.indexOf(order.status as OrderStatus);

    // Has any event in history ever reached one of this step's statuses?
    const reached = config.matchStatuses.some(s =>
        order.history?.some(h => h.toStatus === s)
    );

    if (!reached) return 'upcoming';

    // Is the current live status still within this step's range (not yet moved past)?
    const stepMinIdx = Math.min(...config.matchStatuses.map(s => STATUS_ORDER.indexOf(s)));
    const nextStep = TIMELINE[TIMELINE.indexOf(config) + 1];
    if (nextStep) {
        const nextReached = nextStep.matchStatuses.some(s =>
            order.history?.some(h => h.toStatus === s)
        );
        return nextReached ? 'completed' : 'current';
    }

    return 'completed'; // Last step
}

function getStepTime(config: TimelineConfig, order: OrderDetailExtended): string | undefined {
    const event = order.history?.find(h => config.matchStatuses.includes(h.toStatus as OrderStatus));
    if (!event) return undefined;
    try {
        return format(new Date(event.timestamp), 'h:mm a');
    } catch {
        return undefined;
    }
}

// ─── Badge Icon (seal shape) ─────────────────────────────────────────────────
const BadgeIcon: React.FC<{ done: boolean }> = ({ done }) => {
    const bg = done ? '#16a34a' : '#94a3b8';
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            {/* 8-pointed star made by overlapping two rotated squares */}
            <View style={[styles.badgeStar, { backgroundColor: bg, transform: [{ rotate: '22.5deg' }] }]} />
            <View style={[styles.badgeStar, { backgroundColor: bg, transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.badgeInner, { backgroundColor: bg }]}>
                <Ionicons name="checkmark" size={34} color="#fff" />
            </View>
        </View>
    );
};

// ─── Timeline Row ────────────────────────────────────────────────────────────
const TimelineRow: React.FC<{
    config: TimelineConfig;
    stepStatus: StepStatus;
    time?: string;
    isLast: boolean;
}> = ({ config, stepStatus, time, isLast }) => {
    const iconBg = stepStatus === 'upcoming' ? '#d1d5db' : '#0f172a';
    const iconColor = '#fff';
    const lineColor = stepStatus === 'completed' ? '#0f172a' : '#d1d5db';
    const titleColor = stepStatus === 'upcoming' ? '#9ca3af' : '#0f172a';

    return (
        <View style={styles.timelineRow}>
            {/* Left column: icon + connector line */}
            <View style={styles.timelineLeft}>
                <View style={[styles.timelineCircle, { backgroundColor: iconBg }]}>
                    <Ionicons name={config.icon} size={20} color={iconColor} />
                </View>
                {!isLast && <View style={[styles.connector, { backgroundColor: lineColor }]} />}
            </View>

            {/* Right column: text */}
            <View style={styles.timelineRight}>
                <View style={styles.timelineTitleRow}>
                    <Text style={[styles.timelineTitle, { color: titleColor }]}>{config.label}</Text>
                    {time && (
                        <>
                            <Text style={styles.timelineDot}> • </Text>
                            <Text style={styles.timelineTime}>{time}</Text>
                        </>
                    )}
                </View>
                <Text style={[styles.timelineDesc, { color: stepStatus === 'upcoming' ? '#9ca3af' : '#64748b' }]}>
                    {config.description}
                </Text>
            </View>
        </View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export const TrackOrderScreen = ({ route, navigation }: any) => {
    const { orderId } = route.params;
    const { data: order, isLoading, error } = useOrderDetailsQuery(orderId);

    const isDelivered = order?.status === 'DELIVERED';

    if (isLoading) {
        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Track Order</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text style={styles.loadingText}>Loading your order…</Text>
                </View>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Track Order</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorTitle}>Could not load order</Text>
                    <Text style={styles.errorSub}>Order ID: {orderId}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ── Header ─────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Order</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* ── Confirmed Badge ─────────────────────── */}
                <View style={styles.badgeSection}>
                    <BadgeIcon done={true} />
                    <Text style={styles.confirmedText}>Order Confirmed</Text>
                    <Text style={styles.orderIdText}>
                        Order ID: #{(order as any).order_number || order.orderNumber || orderId.substring(0, 8).toUpperCase()}
                    </Text>
                    {(order as any).discount_amount > 0 && (
                        <Text style={styles.savingsText}>
                            Total Saving ₹{(order as any).discount_amount}
                        </Text>
                    )}
                </View>

                {/* ── Order Status ────────────────────────── */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Order Status</Text>

                    {TIMELINE.map((config, index) => {
                        const stepStatus = resolveStepStatus(config, order);
                        const time = getStepTime(config, order);
                        const isLast = index === TIMELINE.length - 1;
                        return (
                            <TimelineRow
                                key={config.label}
                                config={config}
                                stepStatus={stepStatus}
                                time={time}
                                isLast={isLast}
                            />
                        );
                    })}
                </View>

                {/* ── Actions ─────────────────────────────── */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('LiveMap', { orderId })}
                    >
                        <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>Track on Map</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('SupportTicket')}
                    >
                        <Ionicons name="help-circle-outline" size={22} color="#0f172a" style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryBtnText}>Need Help ?</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: '#F2F3F7',
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#64748b',
        fontSize: 15,
        marginTop: 12,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ef4444',
        marginTop: 8,
    },
    errorSub: {
        fontSize: 13,
        color: '#94a3b8',
    },

    // Badge
    badgeSection: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 32,
    },
    badge: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    badgeStar: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 12,
    },
    badgeInner: {
        width: 74,
        height: 74,
        borderRadius: 37,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmedText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#16a34a',
        marginBottom: 6,
    },
    orderIdText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    savingsText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#16a34a',
    },

    // Status section
    statusSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 24,
    },

    // Timeline row
    timelineRow: {
        flexDirection: 'row',
        minHeight: 80,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 48,
    },
    timelineCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    connector: {
        width: 3,
        flex: 1,
        marginVertical: 2,
        borderRadius: 2,
    },
    timelineRight: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 16,
    },
    timelineTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    timelineTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    timelineDot: {
        fontSize: 16,
        color: '#9ca3af',
    },
    timelineTime: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    timelineDesc: {
        fontSize: 13,
        marginTop: 3,
    },

    // Actions
    actions: {
        paddingHorizontal: 16,
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#0f172a',
        height: 56,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        height: 56,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: '700',
    },
});
