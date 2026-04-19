import { PrismaClient } from '@prisma/client';

// Prisma client instance
export const prisma = new PrismaClient({
  
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
prisma.$on('query', (e) => {
  // Log queries in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  }
});

export default prisma;