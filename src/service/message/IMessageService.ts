import type { MessageResponseDto, MatchResponseDto } from "../../dto/response/message/message-response.dto";
import { MessageType, IMessageMetadata } from "../../types/message";

export interface IMessageService {
    sendMessage(matchId: string, senderId: string, content: string, type?: MessageType, metadata?: IMessageMetadata): Promise<MessageResponseDto>;

    getMessages(matchId: string, userId: string, limit?: number): Promise<MessageResponseDto[]>;

    getMatches(userId: string, page?: number, limit?: number, search?: string): Promise<MatchResponseDto[]>;

    markMessagesAsRead(matchId: string, userId: string): Promise<void>;

    getUnreadCount(userId: string): Promise<number>;

    deleteMessage(messageId: string, userId: string): Promise<void>;
}
