"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rewards_controller_1 = require("../controllers/rewards.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Rewards
router.get('/', rewards_controller_1.getUserRewards);
router.get('/tiers', rewards_controller_1.getRewardTiers);
// Referrals
router.get('/referrals', rewards_controller_1.getUserReferrals);
router.post('/referrals/use', rewards_controller_1.useReferralCode);
// Redemptions
router.post('/redeem', rewards_controller_1.redeemRewards);
router.get('/redemptions', rewards_controller_1.getRedemptionHistory);
exports.default = router;
//# sourceMappingURL=rewards.routes.js.map