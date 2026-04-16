"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAgent = exports.getWaitingConversations = exports.getUserConversations = exports.rateConversation = exports.getConversationHistory = exports.sendChatMessage = exports.startConversation = void 0;
const prisma_1 = require("../utils/prisma");
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
// Validation schemas
const sendMessageSchema = zod_1.z.object({
    sessionId: zod_1.z.string().optional(),
    message: zod_1.z.string().min(1).max(1000),
    userId: zod_1.z.string().optional()
});
const rateConversationSchema = zod_1.z.object({
    conversationId: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(5),
    feedback: zod_1.z.string().max(500).optional()
});
// AI Response logic - Simulated AI responses
const AI_RESPONSES = {
    greeting: [
        {
            keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
            response: 'Hello! Welcome to EcoTrack. I\'m your waste management assistant. How can I help you today?',
            followUp: 'I can help you with scheduling pickups, tracking orders, payment issues, or general questions about our services.'
        }
    ],
    faq: [
        {
            keywords: ['faq', 'question', 'help', 'how', 'what', 'why', 'when', 'where'],
            response: 'I found some helpful information for you:',
            followUp: ''
        }
    ],
    pricing: [
        {
            keywords: ['price', 'cost', 'charge', 'fee', 'how much', 'rates', '₦', 'naira'],
            response: 'Our pricing is flexible based on waste type and volume:',
            followUp: '• Household pickup: ₦1,000 - ₦2,000\n• Bulk waste: ₦3,000 - ₦10,000\n• Business subscriptions start from ₦10,000/month\n\nWould you like a custom quote for your needs?'
        }
    ],
    schedule: [
        {
            keywords: ['schedule', 'pickup', 'book', 'appointment', 'when', 'time', 'date'],
            response: 'Scheduling a pickup is easy! You can:',
            followUp: '1. Go to your dashboard\n2. Click "Schedule Pickup"\n3. Select waste type, weight, and preferred date/time\n4. Confirm and pay\n\nOur collectors will arrive during your scheduled slot.'
        }
    ],
    tracking: [
        {
            keywords: ['track', 'where', 'location', 'driver', 'collector', 'status'],
            response: 'You can track your collector in real-time!',
            followUp: 'Once a collector is assigned, go to "Track Collector" in your dashboard to see their live location on the map.\n\nYou\'ll also receive notifications when they\'re on their way.'
        }
    ],
    payment: [
        {
            keywords: ['pay', 'payment', 'card', 'transfer', 'wallet', 'ussd', 'failed', 'money'],
            response: 'We offer multiple payment options:',
            followUp: '• Card (Visa, Mastercard)\n• Bank Transfer\n• EcoTrack Wallet\n• USSD\n\nAll payments are secure. If you have issues, I can help you resolve them.'
        }
    ],
    wasteTypes: [
        {
            keywords: ['waste', 'type', 'plastic', 'organic', 'paper', 'metal', 'glass', 'electronic', 'hazardous', 'mixed', 'bulky'],
            response: 'We handle various waste types:',
            followUp: '• ORGANIC - Food waste, garden waste\n• PLASTIC - Bottles, containers\n• PAPER - Cardboard, newspapers\n• METAL - Cans, scrap metal\n• GLASS - Bottles, jars\n• ELECTRONIC - E-waste\n• HAZARDOUS - Batteries, chemicals\n• MIXED - General waste\n• BULKY - Furniture, appliances'
        }
    ],
    referral: [
        {
            keywords: ['refer', 'invite', 'friend', 'share', 'bonus', 'earn'],
            response: 'Love that you want to spread the word!',
            followUp: 'Share your referral code with friends and earn:\n• 500 points when they sign up\n• 200 bonus points for you\n\nGo to "Rewards" > "Refer & Earn" to get your code.'
        }
    ],
    rewards: [
        {
            keywords: ['reward', 'points', 'cashback', 'redeem', 'airtime', 'discount'],
            response: 'Our rewards program is great!',
            followUp: '• Earn points for every pickup\n• Get cashback based on your tier\n• Redeem for airtime, wallet credit, or discounts\n\nCheck your points balance in the Rewards section.'
        }
    ],
    complaint: [
        {
            keywords: ['complaint', 'problem', 'issue', 'wrong', 'bad', 'missed', 'late', 'cancel'],
            response: 'I\'m sorry to hear about your experience. Let me help resolve this.',
            followUp: 'Please provide more details:\n• What went wrong?\n• When did it happen?\n• Your pickup ID if applicable\n\nI\'ll escalate this to our support team if needed.'
        }
    ],
    hours: [
        {
            keywords: ['hour', 'time', 'open', 'close', 'available', 'service'],
            response: 'Our service hours are:',
            followUp: '• Pickup scheduling: 24/7 app access\n• Live support: 6 AM - 10 PM daily\n• Collector service: 7 AM - 7 PM\n\nEmergency pickups can be arranged for urgent situations.'
        }
    ]
};
async function findAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    // First check FAQ pages from CMS
    return await findFAQResponse(lowerMessage);
}
async function findFAQResponse(lowerMessage) {
    try {
        // Get published FAQ pages from CMS
        const faqPages = await prisma_1.prisma.cMSPage.findMany({
            where: {
                pageType: 'FAQ',
                status: 'PUBLISHED'
            },
            select: {
                title: true,
                content: true,
                slug: true
            }
        });
        // Search through FAQ content for matches
        for (const faq of faqPages) {
            const faqContent = `${faq.title} ${faq.content}`.toLowerCase();
            const searchTerms = lowerMessage.split(' ').filter(t => t.length > 3);
            const matchedTerms = searchTerms.filter(term => faqContent.includes(term));
            if (matchedTerms.length >= 1) {
                // Extract relevant content (strip HTML tags)
                const cleanContent = faq.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const relevantPart = cleanContent.substring(0, 500) + (cleanContent.length > 500 ? '...' : '');
                return {
                    response: `Based on our FAQ: "${faq.title}"`,
                    followUp: relevantPart || cleanContent.substring(0, 300)
                };
            }
        }
    }
    catch (error) {
        console.error('Error fetching FAQ:', error);
    }
    // Fall back to hardcoded responses
    const lowerMsg = lowerMessage;
    for (const [category, responses] of Object.entries(AI_RESPONSES)) {
        if (category === 'faq')
            continue;
        for (const item of responses) {
            for (const keyword of item.keywords) {
                if (lowerMsg.includes(keyword)) {
                    return {
                        response: item.response,
                        followUp: item.followUp
                    };
                }
            }
        }
    }
    // Default response
    return {
        response: 'Thanks for your message! I\'m here to help with EcoTrack services.',
        followUp: 'I can assist with:\n• Scheduling pickups\n• Tracking collectors\n• Payment issues\n• Pricing information\n• Rewards & referrals\n\nCould you please rephrase your question?'
    };
}
function getContextualSuggestions(conversationHistory) {
    const suggestions = [];
    // Add suggestions based on conversation flow
    if (conversationHistory.length === 0) {
        suggestions.push('How do I schedule a pickup?');
        suggestions.push('What are your prices?');
        suggestions.push('How does tracking work?');
    }
    else {
        const lastMessages = conversationHistory.slice(-2);
        const hasPricing = lastMessages.some(m => m.content.toLowerCase().includes('price'));
        const hasSchedule = lastMessages.some(m => m.content.toLowerCase().includes('schedule'));
        if (!hasPricing)
            suggestions.push('View pricing');
        if (!hasSchedule)
            suggestions.push('Book a pickup');
        suggestions.push('Contact human agent');
    }
    return suggestions;
}
// Start new conversation
const startConversation = async (req, res, next) => {
    try {
        const userId = req.body.userId || null;
        // Create new session
        const sessionId = crypto_1.default.randomBytes(16).toString('hex');
        const conversation = await prisma_1.prisma.chatConversation.create({
            data: {
                userId,
                sessionId,
                status: 'ACTIVE'
            }
        });
        // Send welcome message from bot
        await prisma_1.prisma.chatMessage.create({
            data: {
                conversationId: conversation.id,
                sender: 'BOT',
                content: 'Hello! Welcome to EcoTrack Support. I\'m here to help you with all your waste management questions. How can I assist you today?',
                metadata: JSON.stringify({
                    suggestions: getContextualSuggestions([])
                })
            }
        });
        res.json({
            sessionId,
            conversationId: conversation.id,
            message: 'Hello! Welcome to EcoTrack Support. I\'m your AI assistant and I\'m here to help!'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.startConversation = startConversation;
// Send message to chatbot
const sendChatMessage = async (req, res, next) => {
    try {
        const validatedData = sendMessageSchema.parse(req.body);
        // Find or create conversation
        let conversation;
        if (validatedData.sessionId) {
            conversation = await prisma_1.prisma.chatConversation.findUnique({
                where: { sessionId: validatedData.sessionId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });
        }
        if (!conversation) {
            // Create new conversation
            conversation = await prisma_1.prisma.chatConversation.create({
                data: {
                    userId: validatedData.userId,
                    sessionId: validatedData.sessionId || crypto_1.default.randomBytes(16).toString('hex'),
                    status: 'ACTIVE'
                },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });
        }
        // Save user message
        const userMessage = await prisma_1.prisma.chatMessage.create({
            data: {
                conversationId: conversation.id,
                sender: 'USER',
                content: validatedData.message
            }
        });
        // Get AI response (checks FAQ pages first)
        const aiResponse = await findFAQResponse(validatedData.message.toLowerCase());
        // Save bot response
        const botMessage = await prisma_1.prisma.chatMessage.create({
            data: {
                conversationId: conversation.id,
                sender: 'BOT',
                content: aiResponse.followUp
                    ? `${aiResponse.response}\n\n${aiResponse.followUp}`
                    : aiResponse.response,
                metadata: JSON.stringify({
                    suggestions: getContextualSuggestions(conversation.messages)
                })
            }
        });
        // Check if escalation needed
        const needsEscalation = validatedData.message.toLowerCase().includes('speak to human') ||
            validatedData.message.toLowerCase().includes('real agent') ||
            validatedData.message.toLowerCase().includes('complaint');
        if (needsEscalation) {
            await prisma_1.prisma.chatConversation.update({
                where: { id: conversation.id },
                data: { status: 'WAITING' }
            });
            await prisma_1.prisma.chatMessage.create({
                data: {
                    conversationId: conversation.id,
                    sender: 'BOT',
                    content: 'I\'m connecting you with a human agent. Please hold on...',
                }
            });
        }
        res.json({
            userMessage: {
                id: userMessage.id,
                content: userMessage.content,
                sender: 'USER',
                createdAt: userMessage.createdAt
            },
            botMessage: {
                id: botMessage.id,
                content: botMessage.content,
                sender: 'BOT',
                createdAt: botMessage.createdAt,
                metadata: botMessage.metadata
            },
            sessionId: conversation.sessionId,
            conversationId: conversation.id
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.sendChatMessage = sendChatMessage;
// Get conversation history
const getConversationHistory = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const conversation = await prisma_1.prisma.chatConversation.findUnique({
            where: { sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json({
            conversationId: conversation.id,
            sessionId: conversation.sessionId,
            status: conversation.status,
            messages: conversation.messages.map(m => ({
                id: m.id,
                content: m.content,
                sender: m.sender,
                metadata: m.metadata,
                createdAt: m.createdAt
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getConversationHistory = getConversationHistory;
// Rate conversation
const rateConversation = async (req, res, next) => {
    try {
        const validatedData = rateConversationSchema.parse(req.body);
        const conversation = await prisma_1.prisma.chatConversation.findUnique({
            where: { id: validatedData.conversationId }
        });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        await prisma_1.prisma.chatConversation.update({
            where: { id: validatedData.conversationId },
            data: {
                rating: validatedData.rating,
                feedback: validatedData.feedback,
                isResolved: true,
                status: 'RESOLVED'
            }
        });
        res.json({ message: 'Thank you for your feedback!' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.rateConversation = rateConversation;
// Get user's conversations
const getUserConversations = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const conversations = await prisma_1.prisma.chatConversation.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json({
            conversations: conversations.map(c => ({
                id: c.id,
                sessionId: c.sessionId,
                status: c.status,
                rating: c.rating,
                lastMessage: c.messages[0]?.content || '',
                lastMessageTime: c.messages[0]?.createdAt || c.createdAt,
                createdAt: c.createdAt
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserConversations = getUserConversations;
// Get waiting conversations (for admin)
const getWaitingConversations = async (req, res, next) => {
    try {
        const conversations = await prisma_1.prisma.chatConversation.findMany({
            where: { status: 'WAITING' },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({
            count: conversations.length,
            conversations: conversations.map(c => ({
                id: c.id,
                sessionId: c.sessionId,
                userId: c.userId,
                messageCount: c.messages.length,
                messages: c.messages.map(m => ({
                    id: m.id,
                    content: m.content,
                    sender: m.sender,
                    createdAt: m.createdAt
                })),
                waitingSince: c.createdAt
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWaitingConversations = getWaitingConversations;
// Assign agent to conversation (admin)
const assignAgent = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const agentId = req.user?.id;
        await prisma_1.prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
                status: 'ASSIGNED',
            }
        });
        await prisma_1.prisma.chatMessage.create({
            data: {
                conversationId,
                sender: 'BOT',
                content: 'A support agent has joined the conversation. How can we help you?'
            }
        });
        res.json({ message: 'Conversation assigned successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.assignAgent = assignAgent;
//# sourceMappingURL=chatbot.controller.js.map