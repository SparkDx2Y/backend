import type { INotification, INotificationPopulated } from "../../models/Notification";
import type { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";
import type { IUser } from "../../models/user";

export class NotificationMapper {
    static toResponse(notification: INotificationPopulated | INotification): NotificationResponseDto {
        const fromUser = notification.fromUserId as unknown as (IUser & { profilePhoto?: string }) | undefined;

        return {
            id: notification._id.toString(),
            type: notification.type,
            fromUser: {
                userId: fromUser?._id?.toString() || notification.fromUserId?.toString() || '',
                name: fromUser?.name || 'Unknown',
                profilePhoto: fromUser?.profilePhoto || undefined
            },
            ...(notification.matchId && { matchId: notification.matchId.toString() }),
            ...(notification.messageId && { messageId: notification.messageId.toString() }),
            isRead: notification.isRead,
            createdAt: notification.createdAt
        };
    }
}
