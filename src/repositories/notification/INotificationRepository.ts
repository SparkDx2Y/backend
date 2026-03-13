import type { INotification } from "../../models/Notification";

export interface INotificationRepository {
    create(data: {
        userId: string;
        type: 'like' | 'match' | 'message' | 'report_resolved' | 'report_dismissed' | 'profile_view' | 'subscription_expired' | 'subscription_expiring_soon';
        fromUserId?: string;
        matchId?: string;
        messageId?: string;
    }): Promise<INotification>;
    findByUserId(userId: string, limit?: number): Promise<INotification[]>;
    findUnreadByUserId(userId: string): Promise<INotification[]>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
