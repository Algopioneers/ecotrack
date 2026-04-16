import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

type FeatureTarget = 'ALL' | 'USER' | 'COLLECTOR' | 'BUSINESS';
const TargetAudienceEnum = z.enum(['ALL', 'USER', 'COLLECTOR', 'BUSINESS']);

const createFeatureSchema = z.object({
  title: z.string().min(3).max(100),
  subtitle: z.string().max(100).optional(),
  description: z.string().min(10).max(500),
  icon: z.string().optional(),
  link: z.string().url().optional(),
  linkText: z.string().max(30).optional(),
  imageUrl: z.string().url().optional(),
  badge: z.string().max(20).optional(),
  badgeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  displayOrder: z.number().int().min(0).default(0),
  targetAudience: TargetAudienceEnum.default('ALL'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const updateFeatureSchema = createFeatureSchema.partial();

// Get active features for landing page
export const getActiveFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const target = req.query.audience as FeatureTarget || 'ALL';

    const features = await prisma.landingPageFeature.findMany({
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
    const filteredFeatures = features.filter(f => 
      f.targetAudience === 'ALL' || f.targetAudience === target
    );

    // Increment view counts
    const featureIds = filteredFeatures.map(f => f.id);
    if (featureIds.length > 0) {
      await prisma.landingPageFeature.updateMany({
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
  } catch (error) {
    next(error);
  }
};

// Create new feature (admin only)
export const createFeature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createFeatureSchema.parse(req.body);

    const feature = await prisma.landingPageFeature.create({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Update feature (admin only)
export const updateFeature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateFeatureSchema.parse(req.body);

    const feature = await prisma.landingPageFeature.findUnique({
      where: { id }
    });

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const updated = await prisma.landingPageFeature.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate as any) : feature.startDate,
        endDate: validatedData.endDate ? new Date(validatedData.endDate as any) : feature.endDate
      }
    });

    res.json({
      message: 'Feature updated successfully',
      feature: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Toggle feature active status (admin only)
export const toggleFeatureStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const feature = await prisma.landingPageFeature.findUnique({
      where: { id }
    });

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const updated = await prisma.landingPageFeature.update({
      where: { id },
      data: { isActive: !feature.isActive }
    });

    res.json({
      message: `Feature ${updated.isActive ? 'activated' : 'deactivated'}`,
      feature: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete feature (admin only)
export const deleteFeature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const feature = await prisma.landingPageFeature.findUnique({
      where: { id }
    });

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    await prisma.landingPageFeature.delete({
      where: { id }
    });

    res.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all features (admin only)
export const getAllFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [features, total] = await Promise.all([
      prisma.landingPageFeature.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit)
      }),
      prisma.landingPageFeature.count({ where })
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
  } catch (error) {
    next(error);
  }
};

// Record feature click (public)
export const recordFeatureClick = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const feature = await prisma.landingPageFeature.findUnique({
      where: { id }
    });

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    await prisma.landingPageFeature.update({
      where: { id },
      data: { clickCount: { increment: 1 } }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Reorder features (admin only)
export const reorderFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { features } = req.body;

    if (!Array.isArray(features)) {
      return res.status(400).json({ error: 'Features array required' });
    }

    // Update display order for each feature
    await Promise.all(
      features.map((item: { id: string; displayOrder: number }) =>
        prisma.landingPageFeature.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder }
        })
      )
    );

    res.json({ message: 'Features reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// Duplicate feature (admin only)
export const duplicateFeature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const feature = await prisma.landingPageFeature.findUnique({
      where: { id }
    });

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const duplicate = await prisma.landingPageFeature.create({
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
  } catch (error) {
    next(error);
  }
};