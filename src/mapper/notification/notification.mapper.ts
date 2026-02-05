import { INotification } from "../../models/Notification";
import { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";

export class NotificationMapper {
    static toResponse(notification: INotification): NotificationResponseDto {
        return {
            id: notification._id.toString(),
            type: notification.type,
            fromUser: {
                userId: (notification.fromUserId as any)._id.toString(),
                name: (notification.fromUserId as any).name,
                profilePhoto: (notification.fromUserId as any).profilePhoto || undefined
            },
            ...(notification.matchId && { matchId: notification.matchId.toString() }),
            ...(notification.messageId && { messageId: notification.messageId.toString() }),
            isRead: notification.isRead,
            createdAt: notification.createdAt
        };
    }
}
