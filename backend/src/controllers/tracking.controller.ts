import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { Server as SocketIOServer } from 'socket.io';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation schemas
const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().nonnegative().optional()
});

// Store active collector sockets (in production, use Redis)
const collectorSockets = new Map<string, any>();

export const setupTrackingSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    // Collector connects to tracking
    socket.on('collector:connect', async (data: { collectorId: string }) => {
      try {
        const { collectorId } = data;
        
        // Verify collector exists
        const collector = await prisma.user.findUnique({
          where: { id: collectorId, role: 'COLLECTOR' }
        });

        if (!collector) {
          socket.emit('error', { message: 'Invalid collector ID' });
          return;
        }

        // Store socket connection
        collectorSockets.set(collectorId, socket);
        socket.collectorId = collectorId;

        // Join collector-specific room
        socket.join(`collector:${collectorId}`);

        console.log(`Collector ${collectorId} connected to tracking`);
        socket.emit('tracking:connected', { collectorId });
      } catch (error) {
        console.error('Collector connection error:', error);
        socket.emit('error', { message: 'Connection failed' });
      }
    });

    // Update collector location
    socket.on('collector:location:update', async (data: any) => {
      try {
        const validatedData = updateLocationSchema.parse(data);
        const collectorId = socket.collectorId;

        if (!collectorId) {
          socket.emit('error', { message: 'Collector not authenticated' });
          return;
        }

        // Broadcast to admins and users tracking this collector
        io.to(`admin:tracking`).emit('collector:location:update', {
          collectorId,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          accuracy: validatedData.accuracy,
          heading: validatedData.heading,
          speed: validatedData.speed,
          timestamp: new Date().toISOString()
        });

        // Also broadcast to specific pickup rooms if collector is assigned to active pickups
        const activePickups = await prisma.pickupRequest.findMany({
          where: {
            collectorId,
            status: {
              in: ['ASSIGNED', 'COLLECTED']
            }
          },
          select: { id: true }
        });

        activePickups.forEach(pickup => {
          io.to(`pickup:${pickup.id}`).emit('collector:location:update', {
            collectorId,
            latitude: validatedData.latitude,
            longitude: validatedData.longitude,
            accuracy: validatedData.accuracy,
            heading: validatedData.heading,
            speed: validatedData.speed,
            timestamp: new Date().toISOString()
          });
        });

        socket.emit('location:updated', { success: true });
      } catch (error) {
        if (error instanceof z.ZodError) {
          socket.emit('error', { message: 'Invalid location data', details: error.errors });
        } else {
          console.error('Location update error:', error);
          socket.emit('error', { message: 'Location update failed' });
        }
      }
    });

    // User starts tracking a pickup
    socket.on('user:start:tracking', async (data: { pickupId: string }) => {
      try {
        const { pickupId } = data;
        const userId = socket.handshake.auth.userId; // Would be set during auth

        // Verify user owns this pickup
        const pickup = await prisma.pickupRequest.findUnique({
          where: { id: pickupId, userId }
        });

        if (!pickup) {
          socket.emit('error', { message: 'Unauthorized or pickup not found' });
          return;
        }

        // Join pickup-specific room for tracking
        socket.join(`pickup:${pickupId}`);

        // If collector is assigned, start sending location updates
        if (pickup.collectorId) {
          const collectorSocket = collectorSockets.get(pickup.collectorId);
          if (collectorSocket) {
            // Notify user that tracking is active
            socket.emit('tracking:activated', { 
              pickupId,
              collectorId: pickup.collectorId
            });
          }
        }

        socket.emit('tracking:started', { pickupId });
      } catch (error) {
        console.error('User tracking start error:', error);
        socket.emit('error', { message: 'Failed to start tracking' });
      }
    });

    // Admin starts tracking all collectors
    socket.on('admin:start:tracking', async () => {
      try {
        const userId = socket.handshake.auth.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (user?.role !== 'ADMIN') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        socket.join(`admin:tracking`);
        socket.emit('admin:tracking:activated');
      } catch (error) {
        console.error('Admin tracking start error:', error);
        socket.emit('error', { message: 'Failed to start admin tracking' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      if (socket.collectorId) {
        collectorSockets.delete(socket.collectorId);
        console.log(`Collector ${socket.collectorId} disconnected`);
      }
    });
  });
};

// REST API endpoints for tracking
export const getCollectorLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collectorId } = req.params;
    const user = (req as AuthRequest).user;
    const userId = user?.id;
    const userRole = user?.role;

    // Authorization check
    if (userRole === 'USER') {
      // Users can only track collectors assigned to their active pickups
      const hasActivePickup = await prisma.pickupRequest.findFirst({
        where: {
          userId,
          collectorId,
          status: {
            in: ['ASSIGNED', 'COLLECTED']
          }
        }
      });

      if (!hasActivePickup) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (userRole !== 'ADMIN' && userId !== collectorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const collector = await prisma.user.findUnique({
      where: { 
        id: collectorId,
        role: 'COLLECTOR'
      },
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    res.json({ collector });
  } catch (error) {
    next(error);
  }
};

// Get route between two points (would integrate with Google Maps Directions API)
export const getRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination required' });
    }

    // In a real implementation, we would call Google Maps Directions API here
    // For now, we'll return a mock response
    
    res.json({
      origin,
      destination,
      distance: { text: '5.2 km', value: 5200 },
      duration: { text: '12 mins', value: 720 },
      // Simplified route coordinates
      route: [
        { lat: parseFloat(origin.toString().split(',')[0]), lng: parseFloat(origin.toString().split(',')[1]) },
        { lat: parseFloat(destination.toString().split(',')[0]), lng: parseFloat(destination.toString().split(',')[1]) }
      ]
    });
  } catch (error) {
    next(error);
  }
};