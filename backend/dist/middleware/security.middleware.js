"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.corsOptions = exports.jwtRefresh = exports.sanitizeInput = exports.securityHeaders = exports.paymentRateLimiter = exports.authRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
// Rate limiting middleware
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Stricter rate limit for auth routes
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 failed attempts per hour
    message: {
        error: 'Too many login attempts, please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Payment rate limiter
exports.paymentRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 payment requests per minute
    message: {
        error: 'Too many payment requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Security headers
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
});
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    const allowedFields = ['email', 'password', 'name', 'phone', 'address'];
    if (req.body) {
        for (const key of Object.keys(req.body)) {
            if (!allowedFields.includes(key) && !key.startsWith('_')) {
                delete req.body[key];
            }
        }
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// JWT refresh middleware
const jwtRefresh = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    // Token refresh logic would go here
    // For now, we just pass through
    next();
};
exports.jwtRefresh = jwtRefresh;
// CORS configuration
exports.corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
};
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=security.middleware.js.map