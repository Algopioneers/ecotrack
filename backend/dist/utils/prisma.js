"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Prisma client instance
exports.prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
    ],
});
// Optional: Install middleware for query logging
exports.prisma.$on('query', (e) => {
    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
    }
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map