import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getCollectorLocation, getRoute } from '../controllers/tracking.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get collector location
router.get('/collector/:collectorId/location', getCollectorLocation);

// Get route between two points
router.get('/route', getRoute);

export default router;