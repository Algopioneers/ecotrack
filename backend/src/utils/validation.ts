import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['USER', 'COLLECTOR', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Pickup validation schemas
export const createPickupSchema = z.object({
  wasteType: z.enum([
    'ORGANIC',
    'PLASTIC',
    'PAPER',
    'METAL',
    'GLASS',
    'ELECTRONIC',
    'TEXTILE',
    'HAZARDOUS',
    'MIXED',
    'BULKY',
  ]),
  weightKg: z.number().positive('Weight must be positive').max(1000, 'Maximum weight is 1000kg'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scheduledFor: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const updatePickupSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'COLLECTED', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
  notes: z.string().max(500).optional(),
  actualPrice: z.number().nonnegative().optional(),
});

// Payment validation schemas
export const initializePaymentSchema = z.object({
  pickupId: z.string().uuid('Invalid pickup ID'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CARD', 'BANK_TRANSFER', 'WALLET', 'USSD']),
  email: z.string().email('Invalid email address'),
});

export const walletTopUpSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(100, 'Minimum top-up is ₦100'),
  method: z.enum(['CARD', 'BANK_TRANSFER', 'USSD']),
  email: z.string().email('Invalid email address'),
});

// Location validation schema
export const locationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().nonnegative().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePickupInput = z.infer<typeof createPickupSchema>;
export type UpdatePickupInput = z.infer<typeof updatePickupSchema>;
export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;
export type WalletTopUpInput = z.infer<typeof walletTopUpSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;