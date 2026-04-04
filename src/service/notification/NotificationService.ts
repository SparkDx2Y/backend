import { inject, injectable } from "inversify";
import { INotificationService } from "./INotificationService";
import { DI_TYPES } from "../../di/types";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";
import { NotificationMapper } from "../../mapper/notification/notification.mapper";
import { IUserSubscriptionService } from "../subscription/IUserSubscriptionService";

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository,
        @inject(DI_TYPES.SERVICES.USER_SUBSCRIPTION_SERVICE)
        private readonly _userSubService: IUserSubscriptionService
    ) { }

    async getNotifications(userId: string, page?: number, limit?: number): Promise<NotificationResponseDto[]> {
        const notifications = await this._notificationRepo.findByUserId(userId, page, limit);
        const limits = await this._userSubService.getUserLimits(userId);

        return notifications.map(notif => {
            const dto = NotificationMapper.toResponse(notif);

            if (dto.type === 'profile_view' && !limits.seeWhoViewedProfile) {
                dto.fromUser = { userId: "hidden", name: "Hidden User", profilePhoto: undefined };
                (dto as NotificationResponseDto & { isPremiumLocked?: boolean }).isPremiumLocked = true;
            } else if (dto.type === 'like' && !limits.seeWhoLikedYou) {
                dto.fromUser = { userId: "hidden", name: "Hidden User", profilePhoto: undefined };
                (dto as NotificationResponseDto & { isPremiumLocked?: boolean }).isPremiumLocked = true;
            }

            return dto;
        });
    }


    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this._notificationRepo.markAsRead(notificationId, userId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this._notificationRepo.markAllAsRead(userId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this._notificationRepo.getUnreadCount(userId);
    }
}
