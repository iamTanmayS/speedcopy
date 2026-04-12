import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

// Controllers
import { getAdminDashboard } from '../controllers/admin/admin.dashboard.controller.js';
import { listUsers, getUserDetail, flagUser, deactivateUser, activateUser } from '../controllers/admin/admin.users.controller.js';
import { listVendors, getVendorDetail, lockVendor, unlockVendor, listOnboardingApplications, reviewOnboardingApplication } from '../controllers/admin/admin.vendors.controller.js';
import { listOrders, getOrderDetail, cancelOrder, approveReprint, listRefunds, reviewRefund } from '../controllers/admin/admin.orders.controller.js';
import { listHubs, getHubDetail, createHub, updateHub, pauseHub, resumeHub, getGoLiveChecklist } from '../controllers/admin/admin.hubs.controller.js';
import { listPayouts, getVendorPayoutSummary, listSettlementBatches, createSettlementBatch, processSettlementBatch } from '../controllers/admin/admin.finance.controller.js';
import { listSubAdmins, createSubAdmin, updateSubAdmin, deactivateSubAdmin } from '../controllers/admin/admin.subadmins.controller.js';
import { listAuditLogs, createExportJob, listExportJobs, getExportJobStatus } from '../controllers/admin/admin.audit.controller.js';
import { listSLAPolicies, listSLAAtRiskOrders, updateSLAPolicy } from '../controllers/admin/admin.sla.controller.js';
import { listPlatformSafetyFlags, updateSafetyFlag, toggleHubStatus } from '../controllers/admin/admin.safety.controller.js';
import { listTickets, getTicketDetail, addTicketMessage, updateTicket } from '../controllers/admin/admin.support.controller.js';
import { listCoupons, createCoupon, toggleCoupon } from '../controllers/admin/admin.coupons.controller.js';

const router = Router();
router.use(authenticate);

// Dashboard
router.get('/dashboard', requirePermission('view_reports'), getAdminDashboard);

// Coupons
router.get('/coupons', requirePermission('view_financials'), listCoupons);
router.post('/coupons', requirePermission('manage_sub_admins'), createCoupon);
router.patch('/coupons/:id/toggle', requirePermission('manage_sub_admins'), toggleCoupon);

// SLA Management
router.get('/sla/policies', requirePermission('view_reports'), listSLAPolicies);
router.get('/sla/at-risk', requirePermission('manage_orders'), listSLAAtRiskOrders);
router.patch('/sla/policies/:id', requirePermission('manage_sub_admins'), updateSLAPolicy);

// Support System
router.get('/tickets', requirePermission('manage_orders'), listTickets);
router.get('/tickets/:id', requirePermission('manage_orders'), getTicketDetail);
router.post('/tickets/:id/messages', requirePermission('manage_orders'), addTicketMessage);
router.patch('/tickets/:id', requirePermission('manage_orders'), updateTicket);

// Platform Safety
router.get('/safety/flags', requirePermission('view_reports'), listPlatformSafetyFlags);
router.post('/safety/flags/:key', requirePermission('manage_sub_admins'), updateSafetyFlag);
router.patch('/safety/hubs/:hubId/status', requirePermission('manage_hubs'), toggleHubStatus);

// Users
router.get('/users', requirePermission('manage_users'), listUsers);
router.get('/users/:userId', requirePermission('manage_users'), getUserDetail);
router.patch('/users/:userId/flag', requirePermission('manage_users'), flagUser);
router.patch('/users/:userId/deactivate', requirePermission('manage_users'), deactivateUser);
router.patch('/users/:userId/activate', requirePermission('manage_users'), activateUser);

// Vendors
router.get('/vendors', requirePermission('manage_vendors'), listVendors);
router.get('/vendors/onboarding', requirePermission('manage_vendors'), listOnboardingApplications);
router.post('/vendors/onboarding/:applicationId/review', requirePermission('manage_vendors'), reviewOnboardingApplication);
router.get('/vendors/:vendorId', requirePermission('manage_vendors'), getVendorDetail);
router.patch('/vendors/:vendorId/lock', requirePermission('manage_vendors'), lockVendor);
router.patch('/vendors/:vendorId/unlock', requirePermission('manage_vendors'), unlockVendor);

// Orders
router.get('/orders', requirePermission('manage_orders'), listOrders);
router.get('/orders/:orderId', requirePermission('manage_orders'), getOrderDetail);
router.patch('/orders/:orderId/cancel', requirePermission('manage_orders'), cancelOrder);
router.post('/orders/:orderId/reprint', requirePermission('manage_orders'), approveReprint);

// Refunds
router.get('/refunds', requirePermission('manage_refunds'), listRefunds);
router.post('/refunds/:refundId/review', requirePermission('manage_refunds'), reviewRefund);

// Hubs
router.get('/hubs', requirePermission('manage_hubs'), listHubs);
router.post('/hubs', requirePermission('manage_hubs'), createHub);
router.get('/hubs/:hubId', requirePermission('manage_hubs'), getHubDetail);
router.patch('/hubs/:hubId', requirePermission('manage_hubs'), updateHub);
router.post('/hubs/:hubId/pause', requirePermission('manage_hubs'), pauseHub);
router.post('/hubs/:hubId/resume', requirePermission('manage_hubs'), resumeHub);
router.get('/hubs/:hubId/go-live-checklist', requirePermission('manage_hubs'), getGoLiveChecklist);

// Finance
router.get('/payouts', requirePermission('view_financials'), listPayouts);
router.get('/payouts/batches', requirePermission('view_financials'), listSettlementBatches);
router.post('/payouts/batches', requirePermission('manage_vendor_payouts'), createSettlementBatch);
router.post('/payouts/batches/:batchId/process', requirePermission('manage_vendor_payouts'), processSettlementBatch);
router.get('/payouts/:vendorId/summary', requirePermission('view_financials'), getVendorPayoutSummary);

// Sub-Admins
router.get('/sub-admins', requirePermission('manage_sub_admins'), listSubAdmins);
router.post('/sub-admins', requirePermission('manage_sub_admins'), createSubAdmin);
router.patch('/sub-admins/:adminId', requirePermission('manage_sub_admins'), updateSubAdmin);
router.delete('/sub-admins/:adminId', requirePermission('manage_sub_admins'), deactivateSubAdmin);

// Audit & Exports
router.get('/audit-logs', requirePermission('view_audit_logs'), listAuditLogs);
router.get('/export-jobs', requirePermission('export_reports'), listExportJobs);
router.post('/export-jobs', requirePermission('export_reports'), createExportJob);
router.get('/export-jobs/:jobId', requirePermission('export_reports'), getExportJobStatus);

export default router;
