import { Request, Response, NextFunction } from 'express';
export declare const getUserRewards: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserReferrals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const useReferralCode: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const redeemRewards: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRedemptionHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRewardTiers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const earnCashback: (userId: string, paymentAmount: number) => Promise<void>;
export declare const earnPickupPoints: (userId: string, pickupId: string) => Promise<void>;
//# sourceMappingURL=rewards.controller.d.ts.map