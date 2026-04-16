"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./utils/prisma");
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const pickup_routes_1 = __importDefault(require("./routes/pickup.routes"));
const tracking_routes_1 = __importDefault(require("./routes/tracking.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const rewards_routes_1 = __importDefault(require("./routes/rewards.routes"));
const feature_routes_1 = __importDefault(require("./routes/feature.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const cms_routes_1 = __importDefault(require("./routes/cms.routes"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'EcoTrack API'
    });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/pickups', pickup_routes_1.default);
app.use('/api/tracking', tracking_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/rewards', rewards_routes_1.default);
app.use('/api/features', feature_routes_1.default);
app.use('/api/chatbot', chatbot_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/cms', cms_routes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    // Prisma error handling
    if (err.code === 'P2002') {
        return res.status(409).json({ error: 'Duplicate entry' });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Record not found' });
    }
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// Set up Socket.IO tracking
const tracking_controller_1 = require("./controllers/tracking.controller");
(0, tracking_controller_1.setupTrackingSocket)(io);
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await prisma_1.prisma.$connect();
        console.log('Database connected successfully');
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map