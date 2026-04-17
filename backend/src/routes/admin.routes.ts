import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getPickupAnalytics,
  getUserAnalytics,
  getCollectorPerformance,
  getAllUsers,
  updateUserStatus
} from '../controllers/analytics.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/pickups', getPickupAnalytics);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/collectors', getCollectorPerformance);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

export default router;