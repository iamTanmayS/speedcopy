import { Router } from "express";
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

export default router;
