"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicPage = exports.duplicatePage = exports.deletePage = exports.updatePage = exports.createPage = exports.getPage = exports.getAllPages = void 0;
const prisma_1 = require("../utils/prisma");
const zod_1 = require("zod");
const createPageSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1).max(100),
    title: zod_1.z.string().min(1).max(200),
    content: zod_1.z.string().min(1),
    metaTitle: zod_1.z.string().max(60).optional(),
    metaDescription: zod_1.z.string().max(160).optional(),
    keywords: zod_1.z.string().max(500).optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    pageType: zod_1.z.enum(['ABOUT', 'CONTACT', 'PRIVACY', 'TERMS', 'FAQ', 'BLOG', 'CUSTOM']).default('CUSTOM'),
    featuredImage: zod_1.z.string().url().optional().nullable(),
});
const updatePageSchema = createPageSchema.partial();
// Get all pages (admin)
const getAllPages = async (req, res, next) => {
    try {
        const { status, pageType, search } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (pageType)
            where.pageType = pageType;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { slug: { contains: search } },
            ];
        }
        const pages = await prisma_1.prisma.cMSPage.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPages = getAllPages;
// Get single page by ID or slug
const getPage = async (req, res, next) => {
    try {
        const { id, slug } = req.params;
        const page = await prisma_1.prisma.cMSPage.findFirst({
            where: id ? { id } : { slug, status: 'PUBLISHED' }
        });
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json({ page });
    }
    catch (error) {
        next(error);
    }
};
exports.getPage = getPage;
// Create new page
const createPage = async (req, res, next) => {
    try {
        const validatedData = createPageSchema.parse(req.body);
        const authorId = req.user?.id;
        const existing = await prisma_1.prisma.cMSPage.findUnique({
            where: { slug: validatedData.slug }
        });
        if (existing) {
            return res.status(400).json({ error: 'A page with this slug already exists' });
        }
        const page = await prisma_1.prisma.cMSPage.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.createPage = createPage;
// Update page
const updatePage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updatePageSchema.parse(req.body);
        const existing = await prisma_1.prisma.cMSPage.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Page not found' });
        }
        if (validatedData.slug && validatedData.slug !== existing.slug) {
            const slugExists = await prisma_1.prisma.cMSPage.findUnique({
                where: { slug: validatedData.slug }
            });
            if (slugExists) {
                return res.status(400).json({ error: 'A page with this slug already exists' });
            }
        }
        const wasPublished = existing.status === 'PUBLISHED';
        const isNowPublished = validatedData.status === 'PUBLISHED';
        const page = await prisma_1.prisma.cMSPage.update({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.updatePage = updatePage;
// Delete page
const deletePage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = await prisma_1.prisma.cMSPage.findUnique({ where: { id } });
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        await prisma_1.prisma.cMSPage.delete({ where: { id } });
        res.json({ message: 'Page deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePage = deletePage;
// Duplicate page
const duplicatePage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const original = await prisma_1.prisma.cMSPage.findUnique({ where: { id } });
        if (!original) {
            return res.status(404).json({ error: 'Page not found' });
        }
        let newSlug = `${original.slug}-copy`;
        let counter = 1;
        while (await prisma_1.prisma.cMSPage.findUnique({ where: { slug: newSlug } })) {
            newSlug = `${original.slug}-copy-${counter}`;
            counter++;
        }
        const duplicate = await prisma_1.prisma.cMSPage.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.duplicatePage = duplicatePage;
// Get public page by slug
const getPublicPage = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const page = await prisma_1.prisma.cMSPage.findFirst({
            where: { slug, status: 'PUBLISHED' }
        });
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json({ page });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicPage = getPublicPage;
//# sourceMappingURL=cms.controller.js.map