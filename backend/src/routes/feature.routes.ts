import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import {
  getActiveFeatures,
  createFeature,
  updateFeature,
  toggleFeatureStatus,
  deleteFeature,
  getAllFeatures,
  recordFeatureClick,
  reorderFeatures,
  duplicateFeature
} from '../controllers/feature.controller';

const router = Router();

// Public routes
router.get('/active', getActiveFeatures);
router.get('/:id/click', recordFeatureClick);

// Admin routes (require authentication and admin role)
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getAllFeatures);
router.post('/', createFeature);
router.patch('/:id', updateFeature);
router.patch('/:id/toggle', toggleFeatureStatus);
router.delete('/:id', deleteFeature);
router.post('/reorder', reorderFeatures);
router.post('/:id/duplicate', duplicateFeature);

export default router;