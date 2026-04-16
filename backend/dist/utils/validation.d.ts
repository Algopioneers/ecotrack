import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["USER", "COLLECTOR", "ADMIN"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    phone?: string | undefined;
    address?: string | undefined;
    role?: "USER" | "ADMIN" | "COLLECTOR" | undefined;
}, {
    email: string;
    password: string;
    name: string;
    phone?: string | undefined;
    address?: string | undefined;
    role?: "USER" | "ADMIN" | "COLLECTOR" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}>;
export declare const createPickupSchema: z.ZodObject<{
    wasteType: z.ZodEnum<["ORGANIC", "PLASTIC", "PAPER", "METAL", "GLASS", "ELECTRONIC", "TEXTILE", "HAZARDOUS", "MIXED", "BULKY"]>;
    weightKg: z.ZodNumber;
    address: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    scheduledFor: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address: string;
    wasteType: "ORGANIC" | "PLASTIC" | "PAPER" | "METAL" | "GLASS" | "ELECTRONIC" | "TEXTILE" | "HAZARDOUS" | "MIXED" | "BULKY";
    weightKg: number;
    latitude: number;
    longitude: number;
    scheduledFor: string;
    notes?: string | undefined;
}, {
    address: string;
    wasteType: "ORGANIC" | "PLASTIC" | "PAPER" | "METAL" | "GLASS" | "ELECTRONIC" | "TEXTILE" | "HAZARDOUS" | "MIXED" | "BULKY";
    weightKg: number;
    latitude: number;
    longitude: number;
    scheduledFor: string;
    notes?: string | undefined;
}>;
export declare const updatePickupSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ASSIGNED", "COLLECTED", "COMPLETED", "CANCELLED", "FAILED"]>>;
    notes: z.ZodOptional<z.ZodString>;
    actualPrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
    status?: "PENDING" | "ASSIGNED" | "COLLECTED" | "COMPLETED" | "CANCELLED" | "FAILED" | undefined;
    actualPrice?: number | undefined;
}, {
    notes?: string | undefined;
    status?: "PENDING" | "ASSIGNED" | "COLLECTED" | "COMPLETED" | "CANCELLED" | "FAILED" | undefined;
    actualPrice?: number | undefined;
}>;
export declare const initializePaymentSchema: z.ZodObject<{
    pickupId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodEnum<["CARD", "BANK_TRANSFER", "WALLET", "USSD"]>;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    pickupId: string;
    amount: number;
    method: "CARD" | "BANK_TRANSFER" | "USSD" | "WALLET";
}, {
    email: string;
    pickupId: string;
    amount: number;
    method: "CARD" | "BANK_TRANSFER" | "USSD" | "WALLET";
}>;
export declare const walletTopUpSchema: z.ZodObject<{
    amount: z.ZodNumber;
    method: z.ZodEnum<["CARD", "BANK_TRANSFER", "USSD"]>;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    amount: number;
    method: "CARD" | "BANK_TRANSFER" | "USSD";
}, {
    email: string;
    amount: number;
    method: "CARD" | "BANK_TRANSFER" | "USSD";
}>;
export declare const locationUpdateSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    accuracy: z.ZodOptional<z.ZodNumber>;
    heading: z.ZodOptional<z.ZodNumber>;
    speed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    accuracy?: number | undefined;
    heading?: number | undefined;
    speed?: number | undefined;
}, {
    latitude: number;
    longitude: number;
    accuracy?: number | undefined;
    heading?: number | undefined;
    speed?: number | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePickupInput = z.infer<typeof createPickupSchema>;
export type UpdatePickupInput = z.infer<typeof updatePickupSchema>;
export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;
export type WalletTopUpInput = z.infer<typeof walletTopUpSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
//# sourceMappingURL=validation.d.ts.map