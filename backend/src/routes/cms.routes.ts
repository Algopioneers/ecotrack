import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getAllPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  duplicatePage,
  getPublicPage,
} from '../controllers/cms.controller';

const router = Router();

// Public routes
router.get('/slug/:slug', getPublicPage);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllPages);
router.get('/:id', authenticate, authorize('ADMIN'), getPage);
router.post('/', authenticate, authorize('ADMIN'), createPage);
router.put('/:id', authenticate, authorize('ADMIN'), updatePage);
router.delete('/:id', authenticate, authorize('ADMIN'), deletePage);
router.post('/:id/duplicate', authenticate, authorize('ADMIN'), duplicatePage);

export default router;
