export declare const rateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const paymentRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const sanitizeInput: (req: any, res: any, next: any) => void;
export declare const jwtRefresh: (req: any, res: any, next: any) => any;
export declare const corsOptions: {
    origin: string;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
};
export declare const requestLogger: (req: any, res: any, next: any) => void;
//# sourceMappingURL=security.middleware.d.ts.map