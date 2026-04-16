"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateFeature = exports.reorderFeatures = exports.recordFeatureClick = exports.getAllFeatures = exports.deleteFeature = exports.toggleFeatureStatus = exports.updateFeature = exports.createFeature = exports.getActiveFeatures = void 0;
const prisma_1 = require("../utils/prisma");
const zod_1 = require("zod");
const TargetAudienceEnum = zod_1.z.enum(['ALL', 'USER', 'COLLECTOR', 'BUSINESS']);
const createFeatureSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    subtitle: zod_1.z.string().max(100).optional(),
    description: zod_1.z.string().min(10).max(500),
    icon: zod_1.z.string().optional(),
    link: zod_1.z.string().url().optional(),
    linkText: zod_1.z.string().max(30).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    badge: zod_1.z.string().max(20).optional(),
    badgeColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    displayOrder: zod_1.z.number().int().min(0).default(0),
    targetAudience: TargetAudienceEnum.default('ALL'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional()
});
const updateFeatureSchema = createFeatureSchema.partial();
// Get active features for landing page
const getActiveFeatures = async (req, res, next) => {
    try {
        const now = new Date();
        const target = req.query.audience || 'ALL';
        const features = await prisma_1.prisma.landingPageFeature.findMany({
            where: {
                isActive: true,
                OR: [
                    { startDate: null },
                    { startDate: { lte: now } }
                ],
                AND: [
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: { displayOrder: 'asc' }
        });
        // Filter by target audience
        const filteredFeatures = features.filter(f => f.targetAudience === 'ALL' || f.targetAudience === target);
        // Increment view counts
        const featureIds = filteredFeatures.map(f => f.id);
        if (featureIds.length > 0) {
            await prisma_1.prisma.landingPageFeature.updateMany({
                where: { id: { in: featureIds } },
                data: { viewCount: { increment: 1 } }
            });
        }
        res.json({
            features: filteredFeatures.map(f => ({
                id: f.id,
                title: f.title,
                subtitle: f.subtitle,
                description: f.description,
                icon: f.icon,
                link: f.link,
                linkText: f.linkText,
                imageUrl: f.imageUrl,
                badge: f.badge,
                badgeColor: f.badgeColor,
                displayOrder: f.displayOrder,
                targetAudience: f.targetAudience
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveFeatures = getActiveFeatures;
// Create new feature (admin only)
const createFeature = async (req, res, next) => {
    try {
        const validatedData = createFeatureSchema.parse(req.body);
        const feature = await prisma_1.prisma.landingPageFeature.create({
            data: {
                title: validatedData.title,
                subtitle: validatedData.subtitle,
                description: validatedData.description,
                icon: validatedData.icon,
                link: validatedData.link,
                linkText: validatedData.linkText,
                imageUrl: validatedData.imageUrl,
                badge: validatedData.badge,
                badgeColor: validatedData.badgeColor,
                displayOrder: validatedData.displayOrder,
                targetAudience: validatedData.targetAudience,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null
            }
        });
        res.status(201).json({
            message: 'Feature created successfully',
            feature
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.createFeature = createFeature;
// Update feature (admin only)
const updateFeature = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updateFeatureSchema.parse(req.body);
        const feature = await prisma_1.prisma.landingPageFeature.findUnique({
            where: { id }
        });
        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        const updated = await prisma_1.prisma.landingPageFeature.update({
            where: { id },
            data: {
                ...validatedData,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : feature.startDate,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : feature.endDate
            }
        });
        res.json({
            message: 'Feature updated successfully',
            feature: updated
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.updateFeature = updateFeature;
// Toggle feature active status (admin only)
const toggleFeatureStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const feature = await prisma_1.prisma.landingPageFeature.findUnique({
            where: { id }
        });
        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        const updated = await prisma_1.prisma.landingPageFeature.update({
            where: { id },
            data: { isActive: !feature.isActive }
        });
        res.json({
            message: `Feature ${updated.isActive ? 'activated' : 'deactivated'}`,
            feature: updated
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleFeatureStatus = toggleFeatureStatus;
// Delete feature (admin only)
const deleteFeature = async (req, res, next) => {
    try {
        const { id } = req.params;
        const feature = await prisma_1.prisma.landingPageFeature.findUnique({
            where: { id }
        });
        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        await prisma_1.prisma.landingPageFeature.delete({
            where: { id }
        });
        res.json({ message: 'Feature deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFeature = deleteFeature;
// Get all features (admin only)
const getAllFeatures = async (req, res, next) => {
    try {
        const { isActive, page = 1, limit = 20 } = req.query;
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        const skip = (Number(page) - 1) * Number(limit);
        const [features, total] = await Promise.all([
            prisma_1.prisma.landingPageFeature.findMany({
                where,
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
                skip,
                take: Number(limit)
            }),
            prisma_1.prisma.landingPageFeature.count({ where })
        ]);
        res.json({
            features: features.map(f => ({
                ...f,
                clickRate: f.viewCount > 0 ? ((f.clickCount / f.viewCount) * 100).toFixed(2) : '0.00'
            })),
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFeatures = getAllFeatures;
// Record feature click (public)
const recordFeatureClick = async (req, res, next) => {
    try {
        const { id } = req.params;
        const feature = await prisma_1.prisma.landingPageFeature.findUnique({
            where: { id }
        });
        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        await prisma_1.prisma.landingPageFeature.update({
            where: { id },
            data: { clickCount: { increment: 1 } }
        });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.recordFeatureClick = recordFeatureClick;
// Reorder features (admin only)
const reorderFeatures = async (req, res, next) => {
    try {
        const { features } = req.body;
        if (!Array.isArray(features)) {
            return res.status(400).json({ error: 'Features array required' });
        }
        // Update display order for each feature
        await Promise.all(features.map((item) => prisma_1.prisma.landingPageFeature.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder }
        })));
        res.json({ message: 'Features reordered successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.reorderFeatures = reorderFeatures;
// Duplicate feature (admin only)
const duplicateFeature = async (req, res, next) => {
    try {
        const { id } = req.params;
        const feature = await prisma_1.prisma.landingPageFeature.findUnique({
            where: { id }
        });
        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        const duplicate = await prisma_1.prisma.landingPageFeature.create({
            data: {
                title: `${feature.title} (Copy)`,
                subtitle: feature.subtitle,
                description: feature.description,
                icon: feature.icon,
                link: feature.link,
                linkText: feature.linkText,
                imageUrl: feature.imageUrl,
                badge: feature.badge,
                badgeColor: feature.badgeColor,
                displayOrder: feature.displayOrder + 1,
                targetAudience: feature.targetAudience,
                isActive: false // New duplicate is inactive by default
            }
        });
        res.status(201).json({
            message: 'Feature duplicated successfully',
            feature: duplicate
        });
    }
    catch (error) {
        next(error);
    }
};
exports.duplicateFeature = duplicateFeature;
//# sourceMappingURL=feature.controller.js.map