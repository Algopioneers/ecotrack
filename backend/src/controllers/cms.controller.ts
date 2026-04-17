import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const createPageSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  pageType: z.enum(['ABOUT', 'CONTACT', 'PRIVACY', 'TERMS', 'FAQ', 'BLOG', 'CUSTOM']).default('CUSTOM'),
  featuredImage: z.string().url().optional().nullable(),
});

const updatePageSchema = createPageSchema.partial();

// Get all pages (admin)
export const getAllPages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, pageType, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (pageType) where.pageType = pageType;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { slug: { contains: search as string } },
      ];
    }

    const pages = await prisma.cMSPage.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        pageType: true,
        status: true,
        updatedAt: true,
        publishedAt: true,
      }
    });

    res.json({ pages });
  } catch (error) {
    next(error);
  }
};

// Get single page by ID or slug
export const getPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, slug } = req.params;

    const page = await prisma.cMSPage.findFirst({
      where: id ? { id } : { slug, status: 'PUBLISHED' }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page });
  } catch (error) {
    next(error);
  }
};

// Create new page
export const createPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createPageSchema.parse(req.body);
    const authorId = (req as AuthRequest).user?.id;

    const existing = await prisma.cMSPage.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existing) {
      return res.status(400).json({ error: 'A page with this slug already exists' });
    }

    const page = await prisma.cMSPage.create({
      data: {
        ...validatedData,
        authorId,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      }
    });

    res.status(201).json({
      message: 'Page created successfully',
      page
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Update page
export const updatePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updatePageSchema.parse(req.body);

    const existing = await prisma.cMSPage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Page not found' });
    }

    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await prisma.cMSPage.findUnique({
        where: { slug: validatedData.slug }
      });
      if (slugExists) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }
    }

    const wasPublished = existing.status === 'PUBLISHED';
    const isNowPublished = validatedData.status === 'PUBLISHED';

    const page = await prisma.cMSPage.update({
      where: { id },
      data: {
        ...validatedData,
        publishedAt: !wasPublished && isNowPublished ? new Date() : existing.publishedAt,
      }
    });

    res.json({
      message: 'Page updated successfully',
      page
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

// Delete page
export const deletePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const page = await prisma.cMSPage.findUnique({ where: { id } });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    await prisma.cMSPage.delete({ where: { id } });

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Duplicate page
export const duplicatePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const original = await prisma.cMSPage.findUnique({ where: { id } });
    if (!original) {
      return res.status(404).json({ error: 'Page not found' });
    }

    let newSlug = `${original.slug}-copy`;
    let counter = 1;
    while (await prisma.cMSPage.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${original.slug}-copy-${counter}`;
      counter++;
    }

    const duplicate = await prisma.cMSPage.create({
      data: {
        slug: newSlug,
        title: `${original.title} (Copy)`,
        content: original.content,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        keywords: original.keywords,
        status: 'DRAFT',
        pageType: original.pageType,
        featuredImage: original.featuredImage,
      }
    });

    res.status(201).json({
      message: 'Page duplicated successfully',
      page: duplicate
    });
  } catch (error) {
    next(error);
  }
};

// Get public page by slug
export const getPublicPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const page = await prisma.cMSPage.findFirst({
      where: { slug, status: 'PUBLISHED' }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page });
  } catch (error) {
    next(error);
  }
};
