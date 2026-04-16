"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDeviceToken = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = require("../utils/prisma");
// Get user's notifications
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, unreadOnly } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { userId };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma_1.prisma.notification.count({ where }),
            prisma_1.prisma.notification.count({ where: { userId, isRead: false } })
        ]);
        res.json({
            notifications,
            unreadCount,
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
exports.getNotifications = getNotifications;
// Mark notification as read
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const notification = await prisma_1.prisma.notification.findFirst({
            where: { id, userId }
        });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        const updated = await prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({
            message: 'Notification marked as read',
            notification: updated
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
// Delete a notification
const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const notification = await prisma_1.prisma.notification.findFirst({
            where: { id, userId }
        });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        await prisma_1.prisma.notification.delete({
            where: { id }
        });
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
// Register device token for push notifications
const registerDeviceToken = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { token, platform } = req.body;
        // In production, store this in a separate DeviceToken model
        // For now, we'll store it in a JSON field or create a model
        console.log(`Registering device token for user ${userId}:`, { token, platform });
        res.json({ message: 'Device token registered successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.registerDeviceToken = registerDeviceToken;
//# sourceMappingURL=notification.controller.js.map