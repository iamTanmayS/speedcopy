import { Router } from "express";
import { createOrder, getMyOrders } from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.post("/", createOrder);
router.get("/", getMyOrders);

export default router;
