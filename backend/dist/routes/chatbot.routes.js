"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const chatbot_controller_1 = require("../controllers/chatbot.controller");
const router = (0, express_1.Router)();
// Public chatbot routes
router.post('/start', chatbot_controller_1.startConversation);
router.post('/message', chatbot_controller_1.sendChatMessage);
router.get('/conversation/:sessionId', chatbot_controller_1.getConversationHistory);
// Authenticated user routes
router.get('/conversations', auth_middleware_1.authenticate, chatbot_controller_1.getUserConversations);
router.post('/rate', auth_middleware_1.authenticate, chatbot_controller_1.rateConversation);
// Admin routes
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_2.authorize)('ADMIN'));
router.get('/waiting', chatbot_controller_1.getWaitingConversations);
router.patch('/:conversationId/assign', chatbot_controller_1.assignAgent);
exports.default = router;
//# sourceMappingURL=chatbot.routes.js.map