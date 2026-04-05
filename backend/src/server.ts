import express from "express";
import Stripe from 'stripe';
import cors from 'cors';
import { env } from "./config/config.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.routes.js";

import orderRoutes from "./routes/order.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
app.set('trust proxy', 1);
const stripe = new Stripe(env.stripe_client_secret);

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/wallet", walletRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint for Docker/Render
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        console.log('Creating payment intent for amount:', amount);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            automatic_payment_methods: { enabled: true },
        });

        console.log('Payment intent created:', paymentIntent.id);

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(4000, "0.0.0.0", () => {
    console.log("Server running on port 4000");
});