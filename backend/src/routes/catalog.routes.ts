import { Router } from "express";
import { getCatalog, getProductDetail } from '../controllers/catalog.controller.js';

const router = Router();

// Catalog is public, no auth required for read
router.get("/", getCatalog);
router.get("/:idOrSlug", getProductDetail);

export default router;
