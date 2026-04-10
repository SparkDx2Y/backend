import type { IMessage } from "../../models/Message";
import { MessageType, IMessageMetadata } from "../../types/message";

export interface IMessageRepository {
    createMessage(data: { matchId: string; senderId: string; content: string; type?: MessageType; metadata?: IMessageMetadata }): Promise<IMessage>;

    findMessagesByMatchId(matchId: string, limit?: number): Promise<IMessage[]>;

    markAsRead(messageId: string): Promise<void>;

    markMatchMessagesAsRead(matchId: string, userId: string): Promise<void>;

    findLastMessageByMatchId(matchId: string): Promise<IMessage | null>;

    getUnreadCount(userId: string): Promise<number>;

    getTodayMessageCount(userId: string): Promise<number>;

    deleteMessage(messageId: string, userId: string): Promise<IMessage | null>;
}
