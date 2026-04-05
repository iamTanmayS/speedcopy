import { Router } from "express";
import { getCatalog } from '../controllers/catalog.controller.js';

const router = Router();

// Catalog is public, no auth required for read
router.get("/", getCatalog);

export default router;
