import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getUserRewards,
  getUserReferrals,
  useReferralCode,
  redeemRewards,
  getRedemptionHistory,
  getRewardTiers
} from '../controllers/rewards.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Rewards
router.get('/', getUserRewards);
router.get('/tiers', getRewardTiers);

// Referrals
router.get('/referrals', getUserReferrals);
router.post('/referrals/use', useReferralCode);

// Redemptions
router.post('/redeem', redeemRewards);
router.get('/redemptions', getRedemptionHistory);

export default router;