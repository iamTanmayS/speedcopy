import { Router } from "express";
import { getVendorDashboard, updateOrderStatus } from '../controllers/vendor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get("/dashboard", getVendorDashboard);
router.patch("/orders/:orderId", updateOrderStatus);

export default router;
