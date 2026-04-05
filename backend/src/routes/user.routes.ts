import { Router } from 'express';
import { getMe, updateProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateProfile);

export default router;
