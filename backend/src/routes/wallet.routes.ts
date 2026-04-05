import { Router } from 'express';
import { getBalance, getTransactions, addFunds, getPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } from '../controllers/wallet.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);
router.post('/add-funds', addFunds);
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);
router.patch('/payment-methods/:id/default', setDefaultPaymentMethod);

export default router;
