import type { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";
import type { MessageResponseDto } from "../../dto/response/message/message-response.dto";

export interface SocketNotificationPayload {
    type: 'like' | 'match' | 'message' | 'report_resolved' | 'report_dismissed';
    message: string;
    data: NotificationResponseDto;
}

export interface SocketMessagePayload {
    type: 'message' | 'message_deleted';
    matchId: string;
    message?: MessageResponseDto;
    messageId?: string;
}

export interface SocketMatchPayload {
    type: 'match';
    message: string;
    matchId: string;
    data: NotificationResponseDto;
}
