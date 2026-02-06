import { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";

export interface INotificationService {
    getNotifications(userId: string, limit?: number): Promise<NotificationResponseDto[]>;


    markAsRead(notificationId: string, userId: string): Promise<void>;

    markAllAsRead(userId: string): Promise<void>;

    getUnreadCount(userId: string): Promise<number>;
}
