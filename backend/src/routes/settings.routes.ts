import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getSettings, updateSettings, uploadLogo, uploadFavicon } from '../controllers/settings.controller';

const router = Router();

router.get('/', getSettings);

router.put('/', authenticate, authorize('ADMIN'), updateSettings);

router.post('/upload-logo', authenticate, authorize('ADMIN'), uploadLogo);

router.post('/upload-favicon', authenticate, authorize('ADMIN'), uploadFavicon);

export default router;
