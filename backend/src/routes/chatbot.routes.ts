import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import {
  startConversation,
  sendChatMessage,
  getConversationHistory,
  rateConversation,
  getUserConversations,
  getWaitingConversations,
  assignAgent
} from '../controllers/chatbot.controller';

const router = Router();

// Public chatbot routes
router.post('/start', startConversation);
router.post('/message', sendChatMessage);
router.get('/conversation/:sessionId', getConversationHistory);

// Authenticated user routes
router.get('/conversations', authenticate, getUserConversations);
router.post('/rate', authenticate, rateConversation);

// Admin routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/waiting', getWaitingConversations);
router.patch('/:conversationId/assign', assignAgent);

export default router;