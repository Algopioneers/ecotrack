import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createPickupRequest,
  getUserPickupRequests,
  getPickupRequestById,
  updatePickupRequest,
  getAllPickupRequests
} from '../controllers/pickup.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', createPickupRequest);
router.get('/', getUserPickupRequests);
router.get('/:id', getPickupRequestById);
router.patch('/:id', updatePickupRequest);

// Collector/Admin routes
router.get('/all/all', getAllPickupRequests); // For collectors/admins to see all requests

export default router;