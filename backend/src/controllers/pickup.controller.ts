import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const WasteTypeEnum = z.enum(['ORGANIC', 'PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ELECTRONIC', 'TEXTILE', 'HAZARDOUS', 'MIXED', 'BULKY']);
const RequestStatusEnum = z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COLLECTED', 'COMPLETED', 'CANCELLED', 'FAILED']);

const createPickupSchema = z.object({
  wasteType: WasteTypeEnum,
  weightKg: z.number().positive().max(1000),
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scheduledFor: z.string().datetime(),
  notes: z.string().max(500).optional()
});

const updatePickupSchema = z.object({
  status: RequestStatusEnum.optional(),
  notes: z.string().max(500).optional(),
  actualPrice: z.number().nonnegative().optional()
});

export const createPickupRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const validatedData = createPickupSchema.parse(req.body);

    const pricePerKg = getPricePerKg(validatedData.wasteType);
    const estimatedPrice = validatedData.weightKg * pricePerKg;

    const pickupRequest = await prisma.pickupRequest.create({
      data: {
        userId,
        wasteType: validatedData.wasteType,
        weightKg: validatedData.weightKg,
        address: validatedData.address,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        scheduledFor: new Date(validatedData.scheduledFor),
        estimatedPrice,
        notes: validatedData.notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Pickup request created successfully',
      pickupRequest
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

export const getUserPickupRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [pickupRequests, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        include: {
          collector: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.pickupRequest.count({ where })
    ]);

    res.json({
      pickupRequests,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPickupRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    if (!pickupRequest) {
      return res.status(404).json({ error: 'Pickup request not found' });
    }

    const userId = (req as AuthRequest).user?.id;
    const userRole = (req as AuthRequest).user?.role;

    if (pickupRequest.userId !== userId && 
        pickupRequest.collectorId !== userId && 
        userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ pickupRequest });
  } catch (error) {
    next(error);
  }
};

export const updatePickupRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pickupId = req.params.id;
    const userId = (req as AuthRequest).user?.id;
    const userRole = (req as AuthRequest).user?.role;
    const validatedData = updatePickupSchema.parse(req.body);

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: pickupId }
    });

    if (!pickupRequest) {
      return res.status(404).json({ error: 'Pickup request not found' });
    }

    let canUpdate = false;
    if (userRole === 'ADMIN') {
      canUpdate = true;
    } else if (validatedData.status && 
               ['ASSIGNED', 'COLLECTED', 'COMPLETED'].includes(validatedData.status as string)) {
      canUpdate = pickupRequest.userId !== userId;
    } else {
      canUpdate = pickupRequest.userId === userId && 
                  pickupRequest.status === 'PENDING';
    }

    if (!canUpdate) {
      return res.status(403).json({ error: 'Unauthorized to update this request' });
    }

    if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(pickupRequest.status)) {
      return res.status(400).json({ 
        error: `Cannot update request with status: ${pickupRequest.status}` 
      });
    }

    const updateData: any = { ...validatedData };

    if (validatedData.status === 'ASSIGNED' && userRole === 'COLLECTOR') {
      updateData.collectorId = userId;
    }

    const updatedPickup = await prisma.pickupRequest.update({
      where: { id: pickupId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'Pickup request updated successfully',
      pickupRequest: updatedPickup
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

export const getAllPickupRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = (req as AuthRequest).user?.role;

    if (userRole === 'USER') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = (req as AuthRequest).user?.id;
    const { status, wasteType, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (wasteType && typeof wasteType === 'string') {
      where.wasteType = wasteType;
    }

    if (userRole === 'COLLECTOR') {
      where.OR = [
        { collectorId: null },
        { collectorId: userId }
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [pickupRequests, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          collector: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.pickupRequest.count({ where })
    ]);

    res.json({
      pickupRequests,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
};

function getPricePerKg(wasteType: string): number {
  const basePrices: Record<string, number> = {
    ORGANIC: 50,
    PLASTIC: 100,
    PAPER: 30,
    METAL: 150,
    GLASS: 80,
    ELECTRONIC: 200,
    TEXTILE: 40,
    HAZARDOUS: 500,
    MIXED: 75,
    BULKY: 200
  };

  return basePrices[wasteType] || 50;
}
