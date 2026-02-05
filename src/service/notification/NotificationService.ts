import { inject, injectable } from "inversify";
import { INotificationService } from "./INotificationService";
import { DI_TYPES } from "../../di/types";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";
import { NotificationMapper } from "../../mapper/notification/notification.mapper";

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository
    ) { }

    async getNotifications(userId: string, limit?: number): Promise<NotificationResponseDto[]> {
        const notifications = await this._notificationRepo.findByUserId(userId, limit);
        return notifications.map(notif => NotificationMapper.toResponse(notif));
    }


    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this._notificationRepo.markAsRead(notificationId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this._notificationRepo.markAllAsRead(userId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this._notificationRepo.getUnreadCount(userId);
    }
}
