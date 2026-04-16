"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.locationUpdateSchema = exports.walletTopUpSchema = exports.initializePaymentSchema = exports.updatePickupSchema = exports.createPickupSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// User validation schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    role: zod_1.z.enum(['USER', 'COLLECTOR', 'ADMIN']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
});
// Pickup validation schemas
exports.createPickupSchema = zod_1.z.object({
    wasteType: zod_1.z.enum([
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
    weightKg: zod_1.z.number().positive('Weight must be positive').max(1000, 'Maximum weight is 1000kg'),
    address: zod_1.z.string().min(5, 'Address must be at least 5 characters'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    scheduledFor: zod_1.z.string().datetime(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.updatePickupSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'ASSIGNED', 'COLLECTED', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
    notes: zod_1.z.string().max(500).optional(),
    actualPrice: zod_1.z.number().nonnegative().optional(),
});
// Payment validation schemas
exports.initializePaymentSchema = zod_1.z.object({
    pickupId: zod_1.z.string().uuid('Invalid pickup ID'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    method: zod_1.z.enum(['CARD', 'BANK_TRANSFER', 'WALLET', 'USSD']),
    email: zod_1.z.string().email('Invalid email address'),
});
exports.walletTopUpSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be positive').min(100, 'Minimum top-up is ₦100'),
    method: zod_1.z.enum(['CARD', 'BANK_TRANSFER', 'USSD']),
    email: zod_1.z.string().email('Invalid email address'),
});
// Location validation schema
exports.locationUpdateSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    accuracy: zod_1.z.number().nonnegative().optional(),
    heading: zod_1.z.number().min(0).max(360).optional(),
    speed: zod_1.z.number().nonnegative().optional(),
});
// Pagination schema
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=validation.js.map