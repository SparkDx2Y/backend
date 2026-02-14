import { MessageResponseDto, MatchResponseDto } from "../../dto/response/message/message-response.dto";

export interface IMessageService {
    sendMessage(matchId: string, senderId: string, content: string, type?: 'text' | 'image' | 'audio'): Promise<MessageResponseDto>;

    getMessages(matchId: string, userId: string, limit?: number): Promise<MessageResponseDto[]>;

    getMatches(userId: string): Promise<MatchResponseDto[]>;

    markMessagesAsRead(matchId: string, userId: string): Promise<void>;

    getUnreadCount(userId: string): Promise<number>;
}
