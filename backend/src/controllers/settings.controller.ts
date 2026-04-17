import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const updateSettingsSchema = z.object({
  siteName: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  author: z.string().optional(),
  ogImage: z.string().url().optional().nullable(),
  favicon: z.string().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  logoAlt: z.string().optional(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactAddress: z.string().optional().nullable(),
  socialFacebook: z.string().url().optional().nullable(),
  socialTwitter: z.string().url().optional().nullable(),
  socialInstagram: z.string().url().optional().nullable(),
  socialLinkedIn: z.string().url().optional().nullable(),
  analyticsCode: z.string().optional().nullable(),
});

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'default' }
      });
    }

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateSettingsSchema.parse(req.body);

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: validatedData,
      create: { id: 'default', ...validatedData }
    });

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

export const uploadLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { logo } = req.body;

    if (!logo) {
      return res.status(400).json({ error: 'Logo URL is required' });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: { logo },
      create: { id: 'default', logo }
    });

    res.json({
      message: 'Logo uploaded successfully',
      logo: settings.logo
    });
  } catch (error) {
    next(error);
  }
};

export const uploadFavicon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { favicon } = req.body;

    if (!favicon) {
      return res.status(400).json({ error: 'Favicon URL is required' });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: { favicon },
      create: { id: 'default', favicon }
    });

    res.json({
      message: 'Favicon uploaded successfully',
      favicon: settings.favicon
    });
  } catch (error) {
    next(error);
  }
};
