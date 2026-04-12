import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import type { AdminOverviewDashboard, OrderStatsSummary, VendorPerformanceSummary, HubHealthSummary, RevenueReport } from '../../types/admin.js';
import type { ApiSuccess } from '../../types/shared.js';
import { randomUUID } from 'crypto';

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string };
        const start = dateFrom ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const end = dateTo ?? new Date().toISOString();

        // Order stats
        const orderStats = await pool.query(`
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(total_amount), 0) AS total_gross,
                COALESCE(AVG(total_amount), 0) AS avg_order_value,
                ROUND(COUNT(*) FILTER (WHERE status = 'DELIVERED') * 100.0 / NULLIF(COUNT(*), 0), 2) AS completion_rate,
                ROUND(COUNT(*) FILTER (WHERE status = 'CANCELLED') * 100.0 / NULLIF(COUNT(*), 0), 2) AS cancellation_rate,
                ROUND((SELECT COUNT(*) FROM sla_violations WHERE breached_at BETWEEN $1 AND $2) * 100.0 / NULLIF(COUNT(*), 0), 2) AS sla_breach_rate,
                ROUND((SELECT COUNT(*) FROM refund_records WHERE initiated_at BETWEEN $1 AND $2) * 100.0 / NULLIF(COUNT(*), 0), 2) AS refund_rate
            FROM orders
            WHERE created_at BETWEEN $1 AND $2
        `, [start, end]);

        const row = orderStats.rows[0];
        const orders: OrderStatsSummary = {
            totalOrders: Number(row.total_orders),
            totalGrossValue: Number(row.total_gross),
            averageOrderValue: Number(row.avg_order_value),
            completionRatePercent: Number(row.completion_rate ?? 0),
            slaBreachRatePercent: Number(row.sla_breach_rate ?? 0),
            cancellationRatePercent: Number(row.cancellation_rate ?? 0),
            refundRatePercent: Number(row.refund_rate ?? 0)
        };

        // Vendor performance
        const vendorStats = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE is_available = true AND is_active = true) AS active_vendors,
                COALESCE(SUM(vp.net_payable), 0) AS total_payouts,
                COALESCE(AVG(EXTRACT(EPOCH FROM (ose.timestamp - o.created_at)) / 60), 0) AS avg_accept_time
            FROM vendors
            LEFT JOIN vendor_payout_records vp ON vp.vendor_id = vendors.id
                AND vp.created_at BETWEEN $1 AND $2
            LEFT JOIN orders o ON o.vendor_id = vendors.id AND o.created_at BETWEEN $1 AND $2
            LEFT JOIN order_status_events ose ON ose.order_id = o.id AND ose.to_status = 'ACCEPTED'
        `, [start, end]);

        const vRow = vendorStats.rows[0];
        const vendors: VendorPerformanceSummary = {
            activeVendors: Number(vRow?.active_vendors ?? 0),
            avgAcceptanceTime: Math.round(Number(vRow?.avg_accept_time ?? 0)),
            avgProductionTime: 0, // requires production start/end tracking
            totalVendorPayouts: Number(vRow?.total_payouts ?? 0)
        };

        // Hub health
        const hubRows = await pool.query(`
            SELECT
                h.id AS hub_id,
                h.name AS hub_name,
                COUNT(o.id) FILTER (WHERE o.status IN ('AWAITING_VENDOR_ACCEPTANCE','ACCEPTED','IN_PRODUCTION')) AS orders_processing,
                COUNT(DISTINCT sv.id) AS sla_risk_orders,
                COUNT(DISTINCT v.id) FILTER (WHERE v.is_available = true) AS vendors_online
            FROM hubs h
            LEFT JOIN orders o ON o.hub_id = h.id AND o.created_at BETWEEN $1 AND $2
            LEFT JOIN sla_violations sv ON sv.order_id = o.id AND sv.resolved_at IS NULL
            LEFT JOIN vendors v ON v.hub_id = h.id
            WHERE h.is_active = true
            GROUP BY h.id, h.name
            LIMIT 20
        `, [start, end]);

        const hubHealth: HubHealthSummary[] = hubRows.rows.map(h => ({
            hubId: h.hub_id,
            hubName: h.hub_name,
            ordersProcessing: Number(h.orders_processing ?? 0),
            capacityUtilization: 0,
            vendorsOnline: Number(h.vendors_online ?? 0),
            slaRiskOrders: Number(h.sla_risk_orders ?? 0)
        }));

        // Revenue
        const revenueRow = await pool.query(`
            SELECT
                COALESCE(SUM(total_amount), 0) AS gmv,
                COALESCE(SUM(discount_amount), 0) AS discounts
            FROM orders
            WHERE created_at BETWEEN $1 AND $2
              AND status NOT IN ('CANCELLED','PAYMENT_FAILED')
        `, [start, end]);

        const rv = revenueRow.rows[0];
        const gmv = Number(rv?.gmv ?? 0);
        const discounts = Number(rv?.discounts ?? 0);
        const cogs = Number(vRow?.total_payouts ?? 0);
        const netRevenue = gmv - discounts;
        const grossMargin = netRevenue > 0 ? Math.round(((netRevenue - cogs) / netRevenue) * 100) : 0;

        const revenue: RevenueReport = {
            grossMerchandiseValue: gmv,
            discountsGiven: discounts,
            netRevenue,
            cogs,
            grossMarginPercent: grossMargin
        };

        const dashboard: AdminOverviewDashboard = {
            dateStart: start,
            dateEnd: end,
            orders,
            vendors,
            hubHealth,
            revenue,
            generatedAt: new Date().toISOString()
        };

        const resp: ApiSuccess<AdminOverviewDashboard> = {
            success: true,
            data: dashboard,
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };

        res.status(200).json(resp);
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, timestamp: new Date().toISOString(), requestId: randomUUID() });
    }
};
