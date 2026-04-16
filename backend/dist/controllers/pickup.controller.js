"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPickupRequests = exports.updatePickupRequest = exports.getPickupRequestById = exports.getUserPickupRequests = exports.createPickupRequest = void 0;
const prisma_1 = require("../utils/prisma");
const zod_1 = require("zod");
const WasteTypeEnum = zod_1.z.enum(['ORGANIC', 'PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ELECTRONIC', 'TEXTILE', 'HAZARDOUS', 'MIXED', 'BULKY']);
const RequestStatusEnum = zod_1.z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COLLECTED', 'COMPLETED', 'CANCELLED', 'FAILED']);
const createPickupSchema = zod_1.z.object({
    wasteType: WasteTypeEnum,
    weightKg: zod_1.z.number().positive().max(1000),
    address: zod_1.z.string().min(5),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    scheduledFor: zod_1.z.string().datetime(),
    notes: zod_1.z.string().max(500).optional()
});
const updatePickupSchema = zod_1.z.object({
    status: RequestStatusEnum.optional(),
    notes: zod_1.z.string().max(500).optional(),
    actualPrice: zod_1.z.number().nonnegative().optional()
});
const createPickupRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const validatedData = createPickupSchema.parse(req.body);
        const pricePerKg = getPricePerKg(validatedData.wasteType);
        const estimatedPrice = validatedData.weightKg * pricePerKg;
        const pickupRequest = await prisma_1.prisma.pickupRequest.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.createPickupRequest = createPickupRequest;
const getUserPickupRequests = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { status, page = '1', limit = '10' } = req.query;
        const where = { userId };
        if (status && typeof status === 'string') {
            where.status = status;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [pickupRequests, total] = await Promise.all([
            prisma_1.prisma.pickupRequest.findMany({
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
                take: parseInt(limit)
            }),
            prisma_1.prisma.pickupRequest.count({ where })
        ]);
        res.json({
            pickupRequests,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserPickupRequests = getUserPickupRequests;
const getPickupRequestById = async (req, res, next) => {
    try {
        const pickupRequest = await prisma_1.prisma.pickupRequest.findUnique({
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
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (pickupRequest.userId !== userId &&
            pickupRequest.collectorId !== userId &&
            userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        res.json({ pickupRequest });
    }
    catch (error) {
        next(error);
    }
};
exports.getPickupRequestById = getPickupRequestById;
const updatePickupRequest = async (req, res, next) => {
    try {
        const pickupId = req.params.id;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const validatedData = updatePickupSchema.parse(req.body);
        const pickupRequest = await prisma_1.prisma.pickupRequest.findUnique({
            where: { id: pickupId }
        });
        if (!pickupRequest) {
            return res.status(404).json({ error: 'Pickup request not found' });
        }
        let canUpdate = false;
        if (userRole === 'ADMIN') {
            canUpdate = true;
        }
        else if (validatedData.status &&
            ['ASSIGNED', 'COLLECTED', 'COMPLETED'].includes(validatedData.status)) {
            canUpdate = pickupRequest.userId !== userId;
        }
        else {
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
        const updateData = { ...validatedData };
        if (validatedData.status === 'ASSIGNED' && userRole === 'COLLECTOR') {
            updateData.collectorId = userId;
        }
        const updatedPickup = await prisma_1.prisma.pickupRequest.update({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.updatePickupRequest = updatePickupRequest;
const getAllPickupRequests = async (req, res, next) => {
    try {
        const userRole = req.user?.role;
        if (userRole === 'USER') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const userId = req.user?.id;
        const { status, wasteType, page = '1', limit = '20' } = req.query;
        const where = {};
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
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [pickupRequests, total] = await Promise.all([
            prisma_1.prisma.pickupRequest.findMany({
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
                take: parseInt(limit)
            }),
            prisma_1.prisma.pickupRequest.count({ where })
        ]);
        res.json({
            pickupRequests,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPickupRequests = getAllPickupRequests;
function getPricePerKg(wasteType) {
    const basePrices = {
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
//# sourceMappingURL=pickup.controller.js.map