"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../utils/prisma");
const NotificationTypeEnum = ['PICKUP_REQUEST', 'PICKUP_ASSIGNED', 'PICKUP_COMPLETED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'REMINDER', 'PROMOTION', 'SYSTEM'];
class NotificationService {
    constructor() {
        this.io = null;
    }
    setSocketIO(io) {
        this.io = io;
    }
    async sendPushNotification(fcmToken, notification) {
        try {
            // In production, integrate with Firebase Admin SDK
            // For now, we'll log and emit via Socket.IO
            console.log('Sending push notification:', notification);
            if (this.io) {
                // Emit to user-specific room
                this.io.to(`user:${fcmToken}`).emit('notification', notification);
            }
            return true;
        }
        catch (error) {
            console.error('Push notification error:', error);
            return false;
        }
    }
    async createNotification(data) {
        const notification = await prisma_1.prisma.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                body: data.body,
                type: data.type,
                data: data.data ? JSON.stringify(data.data) : null
            }
        });
        // Send real-time notification via Socket.IO
        if (this.io) {
            this.io.to(`user:${data.userId}`).emit('notification', {
                id: notification.id,
                title: notification.title,
                body: notification.body,
                type: notification.type,
                data: notification.data ? JSON.parse(notification.data) : {}
            });
        }
        return notification;
    }
    // Notification templates
    async notifyPickupAssigned(userId, pickupId, collectorName) {
        return this.createNotification({
            userId,
            title: 'Collector Assigned!',
            body: `${collectorName} has been assigned to your pickup request.`,
            type: 'PICKUP_ASSIGNED',
            data: { pickupId }
        });
    }
    async notifyPickupCompleted(userId, pickupId) {
        return this.createNotification({
            userId,
            title: 'Pickup Completed',
            body: 'Your waste has been collected successfully. Thank you for using EcoTrack!',
            type: 'PICKUP_COMPLETED',
            data: { pickupId }
        });
    }
    async notifyPaymentReceived(userId, amount) {
        return this.createNotification({
            userId,
            title: 'Payment Received',
            body: `Your wallet has been credited with ₦${amount.toLocaleString()}.`,
            type: 'PAYMENT_RECEIVED',
            data: {}
        });
    }
    async notifyPaymentFailed(userId, amount) {
        return this.createNotification({
            userId,
            title: 'Payment Failed',
            body: `Your payment of ₦${amount.toLocaleString()} could not be processed. Please try again.`,
            type: 'PAYMENT_FAILED',
            data: {}
        });
    }
    async notifyReminder(userId, pickupId, scheduledFor) {
        const date = new Date(scheduledFor);
        const formattedDate = date.toLocaleDateString('en-NG', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        return this.createNotification({
            userId,
            title: 'Pickup Reminder',
            body: `Reminder: Your waste pickup is scheduled for ${formattedDate}.`,
            type: 'REMINDER',
            data: { pickupId }
        });
    }
    async notifyPromotion(userId, title, body, promoData) {
        return this.createNotification({
            userId,
            title,
            body,
            type: 'PROMOTION',
            data: promoData || {}
        });
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map