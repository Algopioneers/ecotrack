import { Server as SocketIOServer } from 'socket.io';
interface FirebaseNotification {
    title: string;
    body: string;
    data?: Record<string, string>;
}
declare class NotificationService {
    private io;
    setSocketIO(io: SocketIOServer): void;
    sendPushNotification(fcmToken: string, notification: FirebaseNotification): Promise<boolean>;
    createNotification(data: {
        userId: string;
        title: string;
        body: string;
        type: string;
        data?: Record<string, any>;
    }): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
    notifyPickupAssigned(userId: string, pickupId: string, collectorName: string): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
    notifyPickupCompleted(userId: string, pickupId: string): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
    notifyPaymentReceived(userId: string, amount: number): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
    notifyPaymentFailed(userId: string, amount: number): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
    notifyReminder(userId: string, pickupId: string, scheduledFor: Date): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
    notifyPromotion(userId: string, title: string, body: string, promoData?: Record<string, any>): Promise<{
        id: string;
        userId: string;
        title: string;
        body: string;
        type: string;
        isRead: boolean;
        data: string | null;
        createdAt: Date;
    }>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map