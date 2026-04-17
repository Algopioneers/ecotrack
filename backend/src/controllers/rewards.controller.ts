import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';

const RewardPointTypeEnum = z.enum(['PICKUP', 'PAYMENT', 'REFERRAL_SIGNUP', 'REFERRAL_BONUS', 'CASHBACK', 'BONUS', 'REDEMPTION', 'PICKUP_COMPLETE']);
const RedemptionStatusEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']);
const RewardRedemptionTypeEnum = z.enum(['AIRTIME', 'WALLET_CREDIT', 'DISCOUNT_CODE', 'UTILITY_BILL']);

const useReferralSchema = z.object({
  referralCode: z.string().min(6).max(20)
});

const redeemRewardSchema = z.object({
  points: z.number().int().positive(),
  rewardType: RewardRedemptionTypeEnum
});

const AIRTMIME_PROVIDERS = [
  { name: 'MTN', codes: ['mtn', 'mtnng'] },
  { name: 'Airtel', codes: ['airtel', 'airtelng'] },
  { name: 'Glo', codes: ['glo', 'glong'] },
  { name: '9mobile', codes: ['9mobile', 'etisalat'] }
];

const UTILITY_TYPES = ['electricity', 'water', 'gas', 'internet', 'cable'];

export const getUserRewards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;

    // Get total points
    const pointsAggregation = await prisma.rewardPoint.aggregate({
      where: { userId },
      _sum: { points: true }
    });

    const totalPoints = pointsAggregation._sum.points || 0;

    // Get recent transactions
    const recentTransactions = await prisma.rewardPoint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get current tier
    const tiers = await prisma.rewardTier.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' }
    });

    let currentTier = tiers[0];
    for (const tier of tiers) {
      if (totalPoints >= tier.minPoints && (!tier.maxPoints || totalPoints <= tier.maxPoints)) {
        currentTier = tier;
      }
    }

    // Calculate next tier
    const nextTier = tiers.find(t => t.minPoints > totalPoints);

    res.json({
      totalPoints,
      currentTier: currentTier ? {
        name: currentTier.name,
        cashbackPercent: currentTier.cashbackPercent,
        icon: currentTier.icon,
        color: currentTier.color,
        description: currentTier.description
      } : null,
      nextTier: nextTier ? {
        name: nextTier.name,
        pointsNeeded: nextTier.minPoints - totalPoints,
        cashbackPercent: nextTier.cashbackPercent
      } : null,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        points: t.points,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReferrals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;

    // Get or create referral code
    let referral = await prisma.referral.findFirst({
      where: { referrerId: userId }
    });

    if (!referral) {
      const code = generateReferralCode();
      referral = await prisma.referral.create({
        data: {
          referrerId: userId,
          referralCode: code
        }
      });

      // Update user's referral code
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code }
      });
    }

    // Get referral stats
    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId }
    });

    const completedReferrals = await prisma.referral.count({
      where: { referrerId: userId, status: 'COMPLETED' }
    });

    // Get referral list
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { name: true, email: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate earnings from referrals
    const referralEarnings = await prisma.rewardPoint.aggregate({
      where: {
        userId,
        type: { in: ['REFERRAL_BONUS', 'REFERRAL_SIGNUP'] }
      },
      _sum: { points: true }
    });

    res.json({
      referralCode: referral.referralCode,
      referralLink: `${process.env.CORS_ORIGIN}/register?ref=${referral.referralCode}`,
      totalReferrals,
      completedReferrals,
      pendingReferrals: totalReferrals - completedReferrals,
      referralEarnings: referralEarnings._sum.points || 0,
      referrals: referrals.map(r => ({
        id: r.id,
        status: r.status,
        createdAt: r.referred?.createdAt || r.createdAt,
        referredUser: r.referred ? {
          name: r.referred.name,
          joinedAt: r.referred.createdAt
        } : null
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const useReferralCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const userName = (req as AuthRequest).user?.name;
    const validatedData = useReferralSchema.parse(req.body);

    // Check if user already used a referral
    const existingReferral = await prisma.referral.findFirst({
      where: { referredId: userId }
    });

    if (existingReferral) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    // Find referral by code
    const referral = await prisma.referral.findFirst({
      where: { 
        referralCode: validatedData.referralCode,
        status: 'PENDING'
      },
      include: { referrer: true }
    });

    if (!referral) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Can't refer yourself
    if (referral.referrerId === userId) {
      return res.status(400).json({ error: 'You cannot use your own referral code' });
    }

    // Award points to both users
    const REFERRER_BONUS = 500; // Points for referrer
    const REFERRED_BONUS = 200; // Points for new user

    // Update referral status
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredId: userId,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Award points to referrer
    await prisma.rewardPoint.create({
      data: {
        userId: referral.referrerId,
        points: REFERRER_BONUS,
        type: 'REFERRAL_BONUS',
        source: referral.id,
        description: `Bonus for referring ${userName}`
      }
    });

    // Award points to new user
    await prisma.rewardPoint.create({
      data: {
        userId,
        points: REFERRED_BONUS,
        type: 'REFERRAL_SIGNUP',
        source: referral.id,
        description: `Welcome bonus for using referral code`
      }
    });

    res.json({
      message: 'Referral code applied successfully!',
      bonusPoints: REFERRED_BONUS,
      referrerName: referral.referrer.name
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

export const redeemRewards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const validatedData = redeemRewardSchema.parse(req.body);

    // Get current points balance
    const pointsAggregation = await prisma.rewardPoint.aggregate({
      where: { userId },
      _sum: { points: true }
    });

    const totalPoints = pointsAggregation._sum.points || 0;

    if (totalPoints < validatedData.points) {
      return res.status(400).json({ 
        error: 'Insufficient points',
        required: validatedData.points,
        available: totalPoints
      });
    }

    // Determine reward value
    let rewardValue: any = {};
    let isValid = true;

    switch (validatedData.rewardType) {
      case 'AIRTIME':
        const { provider, phone } = req.body;
        const validProvider = AIRTMIME_PROVIDERS.find(p => 
          p.codes.includes(provider?.toLowerCase())
        );
        if (!validProvider) {
          return res.status(400).json({ 
            error: 'Invalid provider',
            validProviders: AIRTMIME_PROVIDERS.map(p => p.name)
          });
        }
        if (!phone) {
          return res.status(400).json({ error: 'Phone number required for airtime' });
        }
        // Calculate airtime value (1 point = ₦0.5)
        rewardValue = {
          provider: validProvider.name,
          phone,
          amount: (validatedData.points * 0.5)
        };
        break;

      case 'WALLET_CREDIT':
        // Calculate wallet value (1 point = ₦1)
        rewardValue = {
          amount: validatedData.points
        };
        break;

      case 'DISCOUNT_CODE':
        // Generate discount code (10% off per 100 points)
        const discountPercent = Math.min(Math.floor(validatedData.points / 100) * 2, 50);
        rewardValue = {
          code: generateDiscountCode(),
          discountPercent,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        break;

      case 'UTILITY_BILL':
        const { utilityType, accountNumber } = req.body;
        if (!UTILITY_TYPES.includes(utilityType)) {
          return res.status(400).json({ 
            error: 'Invalid utility type',
            validTypes: UTILITY_TYPES
          });
        }
        rewardValue = {
          utilityType,
          accountNumber,
          amount: validatedData.points // 1 point = ₦1
        };
        break;

      default:
        isValid = false;
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid reward type' });
    }

    // Create redemption record
    const redemption = await prisma.rewardRedemption.create({
      data: {
        userId,
        points: validatedData.points,
        rewardType: validatedData.rewardType,
        rewardValue: JSON.stringify(rewardValue)
      }
    });

    // Deduct points
    await prisma.rewardPoint.create({
      data: {
        userId,
        points: -validatedData.points,
        type: 'REDEMPTION',
        source: redemption.id,
        description: `Redeemed for ${validatedData.rewardType}`
      }
    });

    // For wallet credit, process immediately
    if (validatedData.rewardType === 'WALLET_CREDIT') {
      await prisma.wallet.upsert({
        where: { userId },
        update: {
          balance: { increment: validatedData.points }
        },
        create: {
          userId,
          balance: validatedData.points
        }
      });

      await prisma.rewardRedemption.update({
        where: { id: redemption.id },
        data: { status: 'COMPLETED' }
      });
    }

    res.json({
      message: 'Redemption request submitted',
      redemption: {
        id: redemption.id,
        points: redemption.points,
        rewardType: redemption.rewardType,
        rewardValue,
        status: redemption.status
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

export const getRedemptionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { status, page = 1, limit = 20 } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [redemptions, total] = await Promise.all([
      prisma.rewardRedemption.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.rewardRedemption.count({ where })
    ]);

    res.json({
      redemptions: redemptions.map(r => ({
        id: r.id,
        points: r.points,
        rewardType: r.rewardType,
        rewardValue: JSON.parse(r.rewardValue || '{}'),
        status: r.status,
        createdAt: r.createdAt,
        processedAt: r.processedAt
      })),
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

export const getRewardTiers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tiers = await prisma.rewardTier.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' }
    });

    res.json({
      tiers: tiers.map(t => ({
        id: t.id,
        name: t.name,
        minPoints: t.minPoints,
        maxPoints: t.maxPoints,
        cashbackPercent: t.cashbackPercent,
        description: t.description,
        icon: t.icon,
        color: t.color
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const earnCashback = async (userId: string, paymentAmount: number) => {
  // Calculate user's cashback percentage based on tier
  const pointsAggregation = await prisma.rewardPoint.aggregate({
    where: { userId },
    _sum: { points: true }
  });

  const totalPoints = pointsAggregation._sum.points || 0;

  const currentTier = await prisma.rewardTier.findFirst({
    where: {
      isActive: true,
      minPoints: { lte: totalPoints },
      OR: [
        { maxPoints: null },
        { maxPoints: { gte: totalPoints } }
      ]
    },
    orderBy: { minPoints: 'desc' }
  });

  if (currentTier) {
    const cashbackPoints = Math.floor(paymentAmount * currentTier.cashbackPercent);
    
    if (cashbackPoints > 0) {
      await prisma.rewardPoint.create({
        data: {
          userId,
          points: cashbackPoints,
          type: 'CASHBACK',
          description: `Cashback (${currentTier.cashbackPercent * 100}%) on payment`
        }
      });
    }
  }
};

export const earnPickupPoints = async (userId: string, pickupId: string) => {
  const POINTS_PER_PICKUP = 50;
  
  await prisma.rewardPoint.create({
    data: {
      userId,
      points: POINTS_PER_PICKUP,
      type: 'PICKUP_COMPLETE',
      source: pickupId,
      description: 'Points for completing pickup'
    }
  });
};

// Helper functions
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ECO';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateDiscountCode(): string {
  return `ECO${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}