import { IMessage } from "../../models/Message";

export interface IMessageRepository {
    createMessage(data: { matchId: string; senderId: string; content: string }): Promise<IMessage>;

    findMessagesByMatchId(matchId: string, limit?: number): Promise<IMessage[]>;
    
    markAsRead(messageId: string): Promise<void>;
    
    markMatchMessagesAsRead(matchId: string, userId: string): Promise<void>;
    
    getUnreadCount(userId: string): Promise<number>;
}
