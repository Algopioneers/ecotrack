"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFavicon = exports.uploadLogo = exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = require("../utils/prisma");
const zod_1 = require("zod");
const updateSettingsSchema = zod_1.z.object({
    siteName: zod_1.z.string().optional(),
    tagline: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    keywords: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    ogImage: zod_1.z.string().url().optional().nullable(),
    favicon: zod_1.z.string().optional().nullable(),
    logo: zod_1.z.string().url().optional().nullable(),
    logoAlt: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email().optional().nullable(),
    contactPhone: zod_1.z.string().optional().nullable(),
    contactAddress: zod_1.z.string().optional().nullable(),
    socialFacebook: zod_1.z.string().url().optional().nullable(),
    socialTwitter: zod_1.z.string().url().optional().nullable(),
    socialInstagram: zod_1.z.string().url().optional().nullable(),
    socialLinkedIn: zod_1.z.string().url().optional().nullable(),
    analyticsCode: zod_1.z.string().optional().nullable(),
});
const getSettings = async (req, res, next) => {
    try {
        let settings = await prisma_1.prisma.siteSettings.findUnique({
            where: { id: 'default' }
        });
        if (!settings) {
            settings = await prisma_1.prisma.siteSettings.create({
                data: { id: 'default' }
            });
        }
        res.json({ settings });
    }
    catch (error) {
        next(error);
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res, next) => {
    try {
        const validatedData = updateSettingsSchema.parse(req.body);
        const settings = await prisma_1.prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: validatedData,
            create: { id: 'default', ...validatedData }
        });
        res.json({
            message: 'Settings updated successfully',
            settings
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};
exports.updateSettings = updateSettings;
const uploadLogo = async (req, res, next) => {
    try {
        const { logo } = req.body;
        if (!logo) {
            return res.status(400).json({ error: 'Logo URL is required' });
        }
        const settings = await prisma_1.prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: { logo },
            create: { id: 'default', logo }
        });
        res.json({
            message: 'Logo uploaded successfully',
            logo: settings.logo
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadLogo = uploadLogo;
const uploadFavicon = async (req, res, next) => {
    try {
        const { favicon } = req.body;
        if (!favicon) {
            return res.status(400).json({ error: 'Favicon URL is required' });
        }
        const settings = await prisma_1.prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: { favicon },
            create: { id: 'default', favicon }
        });
        res.json({
            message: 'Favicon uploaded successfully',
            favicon: settings.favicon
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadFavicon = uploadFavicon;
//# sourceMappingURL=settings.controller.js.map