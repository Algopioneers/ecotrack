import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';

const PaymentMethodEnum = z.enum(['CARD', 'BANK_TRANSFER', 'USSD', 'MOBILE_MONEY', 'WALLET']);

const initializePaymentSchema = z.object({
  pickupId: z.string().uuid(),
  amount: z.number().positive(),
  method: PaymentMethodEnum,
  email: z.string().email()
});

const verifyPaymentSchema = z.object({
  reference: z.string()
});

const walletTopUpSchema = z.object({
  amount: z.number().positive().min(100),
  method: PaymentMethodEnum,
  email: z.string().email()
});

// Paystack API helper
const paystackBaseUrl = 'https://api.paystack.co';
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';

interface PaystackResponse {
  status: boolean;
  data?: {
    authorization_url?: string;
    status?: string;
    amount?: number;
  };
  message?: string;
}

async function initializePaystackPayment(data: {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: any;
}): Promise<PaystackResponse> {
  const response = await fetch(`${paystackBaseUrl}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json() as Promise<PaystackResponse>;
}

async function verifyPaystackPayment(reference: string): Promise<PaystackResponse> {
  const response = await fetch(`${paystackBaseUrl}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${paystackSecretKey}`
    }
  });
  return response.json() as Promise<PaystackResponse>;
}

// Initialize payment for a pickup
export const initializePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const validatedData = initializePaymentSchema.parse(req.body);

    // Verify pickup exists and belongs to user
    const pickup = await prisma.pickupRequest.findFirst({
      where: {
        id: validatedData.pickupId,
        userId
      }
    });

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup request not found' });
    }

    if (pickup.status === 'COMPLETED' || pickup.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot pay for this pickup request' });
    }

    // Check for existing pending payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        pickupId: validatedData.pickupId,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already in progress for this pickup' });
    }

    // Generate unique reference
    const reference = `ECOT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        pickupId: validatedData.pickupId,
        amount: validatedData.amount,
        status: 'PENDING',
        method: validatedData.method,
        transactionId: reference
      }
    });

    // Initialize Paystack payment
    const paystackResponse = await initializePaystackPayment({
      email: validatedData.email,
      amount: Math.round(validatedData.amount * 100), // Paystack expects kobo
      reference,
      callback_url: `${process.env.CORS_ORIGIN}/payments/callback`,
      metadata: {
        paymentId: payment.id,
        userId,
        pickupId: validatedData.pickupId,
        type: 'pickup_payment'
      }
    });

    if (!paystackResponse.status) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
      return res.status(400).json({ error: 'Failed to initialize payment' });
    }

    res.json({
      message: 'Payment initialized successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        reference: payment.transactionId,
        authorizationUrl: paystackResponse.data?.authorization_url
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Verify payment callback from Paystack
export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reference } = verifyPaymentSchema.parse(req.query);

    // Find payment by reference
    const payment = await prisma.payment.findFirst({
      where: { transactionId: reference },
      include: {
        user: true,
        pickup: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify with Paystack
    const paystackResponse = await verifyPaystackPayment(reference);

    if (!paystackResponse.status || paystackResponse.data?.status !== 'success') {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          gatewayResponse: JSON.stringify(paystackResponse)
        }
      });
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment status to completed
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        gatewayResponse: JSON.stringify(paystackResponse)
      }
    });

    // If this was a pickup payment, update pickup status
    if (payment.pickupId && payment.pickup) {
      await prisma.pickupRequest.update({
        where: { id: payment.pickupId },
        data: {
          status: 'ASSIGNED',
          actualPrice: payment.amount
        }
      });
    }

    res.json({
      message: 'Payment verified successfully',
      payment: updatedPayment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Wallet top-up
export const walletTopUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const validatedData = walletTopUpSchema.parse(req.body);

    // Generate unique reference
    const reference = `ECOT-WLT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: validatedData.amount,
        status: 'PENDING',
        method: validatedData.method,
        transactionId: reference
      }
    });

    // Initialize Paystack payment
    const paystackResponse = await initializePaystackPayment({
      email: validatedData.email,
      amount: Math.round(validatedData.amount * 100),
      reference,
      callback_url: `${process.env.CORS_ORIGIN}/wallet/callback`,
      metadata: {
        paymentId: payment.id,
        userId,
        type: 'wallet_topup'
      }
    });

    if (!paystackResponse.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
      return res.status(400).json({ error: 'Failed to initialize top-up' });
    }

    res.json({
      message: 'Top-up initialized successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        reference: payment.transactionId,
        authorizationUrl: paystackResponse.data?.authorization_url
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Get wallet balance
export const getWalletBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: { userId }
      });
    }

    res.json({ wallet });
  } catch (error) {
    next(error);
  }
};

// Pay with wallet balance
export const payWithWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { pickupId } = req.body;

    // Get wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet not found' });
    }

    // Get pickup
    const pickup = await prisma.pickupRequest.findFirst({
      where: { id: pickupId, userId }
    });

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    if (pickup.status === 'COMPLETED' || pickup.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot pay for this pickup' });
    }

    if (wallet.balance < pickup.estimatedPrice) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: pickup.estimatedPrice,
        available: wallet.balance
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        pickupId,
        amount: pickup.estimatedPrice,
        status: 'COMPLETED',
        method: 'WALLET',
        transactionId: `ECOT-WLT-PAY-${Date.now()}`
      }
    });

    // Deduct from wallet
    await prisma.wallet.update({
      where: { userId },
      data: { balance: wallet.balance - pickup.estimatedPrice }
    });

    // Update pickup status
    await prisma.pickupRequest.update({
      where: { id: pickupId },
      data: {
        status: 'ASSIGNED',
        actualPrice: pickup.estimatedPrice
      }
    });

    res.json({
      message: 'Payment successful',
      payment,
      newBalance: wallet.balance - pickup.estimatedPrice
    });
  } catch (error) {
    next(error);
  }
};

// Get user's payment history
export const getPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        include: {
          pickup: {
            select: {
              id: true,
              address: true,
              wasteType: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.payment.count({ where: { userId } })
    ]);

    res.json({
      payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Paystack
export const paystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const event = req.body;

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(JSON.stringify(event))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        const paymentData = event.data.metadata;
        
        if (paymentData.type === 'wallet_topup') {
          // Credit wallet
          const wallet = await prisma.wallet.findUnique({
            where: { userId: paymentData.userId }
          });

          if (wallet) {
            await prisma.wallet.update({
              where: { userId: paymentData.userId },
              data: { balance: wallet.balance + (event.data.amount / 100) }
            });
          }

          // Update payment status
          await prisma.payment.update({
            where: { id: paymentData.paymentId },
            data: {
              status: 'COMPLETED',
              gatewayResponse: JSON.stringify(event)
            }
          });
        } else if (paymentData.type === 'pickup_payment') {
          await prisma.payment.update({
            where: { id: paymentData.paymentId },
            data: {
              status: 'COMPLETED',
              gatewayResponse: JSON.stringify(event)
            }
          });

          // Update pickup status
          const payment = await prisma.payment.findUnique({
            where: { id: paymentData.paymentId }
          });

          if (payment?.pickupId) {
            await prisma.pickupRequest.update({
              where: { id: payment.pickupId },
              data: { status: 'ASSIGNED' }
            });
          }
        }
        break;

      case 'charge.failed':
        const failedPaymentData = event.data.metadata;
        await prisma.payment.update({
          where: { id: failedPaymentData.paymentId },
          data: {
            status: 'FAILED',
            gatewayResponse: JSON.stringify(event)
          }
        });
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};