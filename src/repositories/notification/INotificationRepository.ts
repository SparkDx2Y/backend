import { INotification } from "../../models/Notification";

export interface INotificationRepository {
    create(data: {
        userId: string;
        type: 'like' | 'match' | 'message';
        fromUserId: string;
        matchId?: string;
        messageId?: string;
    }): Promise<INotification>;
    findByUserId(userId: string, limit?: number): Promise<INotification[]>;
    findUnreadByUserId(userId: string): Promise<INotification[]>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
