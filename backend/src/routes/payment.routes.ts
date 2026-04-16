import express, { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  initializePayment,
  verifyPayment,
  walletTopUp,
  getWalletBalance,
  payWithWallet,
  getPaymentHistory,
  paystackWebhook
} from '../controllers/payment.controller';

const router = Router();

// Webhook route (no auth required for Paystack callback)
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), paystackWebhook);

// Payment routes (require authentication)
router.post('/initialize', authenticate, initializePayment);
router.get('/verify', authenticate, verifyPayment);
router.post('/wallet/topup', authenticate, walletTopUp);
router.get('/wallet', authenticate, getWalletBalance);
router.post('/wallet/pay', authenticate, payWithWallet);
router.get('/history', authenticate, getPaymentHistory);

export default router;