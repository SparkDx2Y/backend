import { inject, injectable } from "inversify";
import { IMessageService } from "./IMessageService";
import { DI_TYPES } from "../../di/types";
import { IMessageRepository } from "../../repositories/message/IMessageRepository";
import { IMatchedUsersRepository } from "../../repositories/match/IMatchedUsersRepository";
import { MessageResponseDto, MatchResponseDto } from "../../dto/response/message/message-response.dto";
import { MessageMapper } from "../../mapper/message/message.mapper";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

import { ISocketService } from "../socket/ISocketService";

@injectable()
export class MessageService implements IMessageService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.MESSAGE_REPOSITORY)
        private readonly _messageRepo: IMessageRepository,
        @inject(DI_TYPES.REPOSITORIES.MATCHED_USERS_REPOSITORY)
        private readonly _matchedUsersRepo: IMatchedUsersRepository,
        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService
    ) { }


    // ==============================================
    // Send Message
    // ==============================================
    async sendMessage(matchId: string, senderId: string, content: string, type: 'text' | 'image' | 'audio' = 'text'): Promise<MessageResponseDto> {

       
        const match = await this._matchedUsersRepo.findMatchById(matchId);
        if (!match) {
            throw new AppError("Match not found", HTTP_STATUS.NOT_FOUND);
        }

        const userIds = match.users.map((userId) =>
            typeof userId === "string" ? userId : userId._id.toString()
        );
        
        if (!userIds.includes(senderId)) {
            throw new AppError("You are not part of this match", HTTP_STATUS.FORBIDDEN);
        }

       
        const isAnyUserBlocked = match.users.some((user: any) => user.isBlocked);
        if (isAnyUserBlocked) {
            throw new AppError("This conversation is no longer available", HTTP_STATUS.FORBIDDEN);
        }

       
        const message = await this._messageRepo.createMessage({
            matchId,
            senderId,
            content,
            type
        });

        
        await this._matchedUsersRepo.updateLastMessageAt(matchId, new Date());

        
        const recipientId = userIds.find((userId) => userId !== senderId);

        
        if (recipientId) {

            const messageResponse = MessageMapper.toMessageResponse(message);
            
            this._socketService.sendMessage(recipientId, {
                type: 'message',
                matchId: matchId,
                message: messageResponse
            });

        }
        return MessageMapper.toMessageResponse(message);
    }

    // ==============================================
    // Get Messages
    // ==============================================
    async getMessages(matchId: string, userId: string, limit?: number): Promise<MessageResponseDto[]> {
       
        const match = await this._matchedUsersRepo.findMatchById(matchId);

        if (!match) {
            throw new AppError("Match not found", HTTP_STATUS.NOT_FOUND);
        }

        const userIds = match.users.map((user) =>
            typeof user === "string" ? user : user._id.toString()
        );

        if (!userIds.includes(userId)) {
            throw new AppError("You are not part of this match", HTTP_STATUS.FORBIDDEN);
        }

      
        const messages = await this._messageRepo.findMessagesByMatchId(matchId, limit);

        return messages.map(msg => MessageMapper.toMessageResponse(msg));


    }

    // ==============================================    
    // Get Matches
    // ==============================================    
    async getMatches(userId: string): Promise<MatchResponseDto[]> {
        const matches = await this._matchedUsersRepo.findMatchesByUserId(userId);

        const result = await Promise.all(matches.map(async (match) => {
            const lastMessage = await this._messageRepo.findLastMessageByMatchId(match._id.toString());
            return MessageMapper.toMatchResponse(match, lastMessage);
        }));

        return result;
    }

    // ==============================================    
    // Mark Messages As Read
    // ==============================================    
    async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
        await this._messageRepo.markMatchMessagesAsRead(matchId, userId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this._messageRepo.getUnreadCount(userId);
    }

    // ==============================================    
    // Delete Message
    // ==============================================    
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const deletedMessage = await this._messageRepo.deleteMessage(messageId, userId);

        if (!deletedMessage) {
            throw new AppError("Message not found or you are not authorized to delete it", HTTP_STATUS.NOT_FOUND);
        }

       
        const match = await this._matchedUsersRepo.findMatchById(deletedMessage.matchId.toString());
        if (match) {
            const userIds = match.users.map((id) =>
                typeof id === "string" ? id : id._id.toString()
            );
            const recipientId = userIds.find((id) => id !== userId);

            if (recipientId) {
                this._socketService.sendMessage(recipientId, {
                    type: 'message_deleted',
                    matchId: deletedMessage.matchId.toString(),
                    messageId: messageId
                });
            }
        }
    }
}
