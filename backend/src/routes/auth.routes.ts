import { Router } from 'express';
import { register, login, refresh, verifyOTP } from '../controllers/auth.controller.js';
import { generateTokens } from '../utils/jwt.util.js';
import pool from '../config/db/db.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/refresh', refresh);

// DEV-ONLY: Get a real JWT for a given email - auto-creates user if not exists.
// Used by the frontend on startup to bypass OTP flow in development.
// REMOVE or guard this endpoint in production.
router.post('/dev-token-by-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ success: false, error: 'email is required' });
            return;
        }

        // Find or auto-create the user in the DB
        let userResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);

        if (!userResult.rows.length) {
            userResult = await pool.query(
                `INSERT INTO users (email, provider, role, name) VALUES ($1, 'email', 'customer', 'Dev Customer') RETURNING id, role`,
                [email]
            );
        }

        const user = userResult.rows[0];
        const tokens = generateTokens({ userId: user.id, role: user.role ?? 'customer', permissions: [] });

        res.status(200).json({
            success: true,
            data: { tokens: { accessToken: tokens.accessToken }, userId: user.id }
        });
    } catch (err: any) {
        console.error('Dev-token-by-email error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
