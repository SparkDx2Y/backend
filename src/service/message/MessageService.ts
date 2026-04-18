import { inject, injectable } from "inversify";
import { IMessageService } from "./IMessageService";
import { DI_TYPES } from "../../di/types";
import { IMessageRepository } from "../../repositories/message/IMessageRepository";
import { IMatchedUsersRepository } from "../../repositories/match/IMatchedUsersRepository";
import { MessageResponseDto, MatchResponseDto } from "../../dto/response/message/message-response.dto";
import { MessageMapper } from "../../mapper/message/message.mapper";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import logger from "../../config/logger";

import { MessageType, IMessageMetadata } from "../../types/message";
import { ISocketService } from "../socket/ISocketService";

import { IUserSubscriptionService } from "../subscription/IUserSubscriptionService";

@injectable()
export class MessageService implements IMessageService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.MESSAGE_REPOSITORY)
        private readonly _messageRepo: IMessageRepository,
        @inject(DI_TYPES.REPOSITORIES.MATCHED_USERS_REPOSITORY)
        private readonly _matchedUsersRepo: IMatchedUsersRepository,
        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService,
        @inject(DI_TYPES.SERVICES.USER_SUBSCRIPTION_SERVICE)
        private readonly _userSubService: IUserSubscriptionService
    ) { }

    // ==============================================
    // Send Message
    // ==============================================
    async sendMessage(matchId: string, senderId: string, content: string, type: MessageType = 'text', metadata?: IMessageMetadata): Promise<MessageResponseDto> {

        const limits = await this._userSubService.getUserLimits(senderId);

        if (!limits.chatEnabled) {
            throw new AppError("Direct messaging is not enabled in your current plan. Please upgrade to send messages.", HTTP_STATUS.FORBIDDEN);
        }

        if (type === 'date_proposal' && !limits.dateProposalEnabled) {
            throw new AppError("Date proposals are a premium feature. Upgrade your plan to send date invites!", HTTP_STATUS.FORBIDDEN);
        }

        if (type === 'image' || type === 'audio') {
            if (!limits.mediaSharingEnabled && type === 'image') {
                throw new AppError("Media sharing is not enabled in your current plan.", HTTP_STATUS.FORBIDDEN);
            }
            if (!limits.audioEnabled && type === 'audio') {
                throw new AppError("Audio messaging is not enabled in your current plan.", HTTP_STATUS.FORBIDDEN);
            }
        }

        if (limits.dailyMessageLimit !== -1) {
            const todayMessages = await this._messageRepo.getTodayMessageCount(senderId);
            if (todayMessages >= limits.dailyMessageLimit) {
                throw new AppError(`You have reached your daily limit of ${limits.dailyMessageLimit} messages. Upgrade your plan for unlimited messaging!`, HTTP_STATUS.FORBIDDEN);
            }
        }

        const match = await this._matchedUsersRepo.findMatchById(matchId);
        if (!match) {
            throw new AppError("Match not found", HTTP_STATUS.NOT_FOUND);
        }

        const userIds = match.users.map((user) => user._id.toString());

        if (!userIds.includes(senderId)) {
            throw new AppError("You are not part of this match", HTTP_STATUS.FORBIDDEN);
        }

        const isAnyUserBlocked = match.users.some((user) => user.isBlocked);
        if (isAnyUserBlocked) {
            throw new AppError("This conversation is no longer available", HTTP_STATUS.FORBIDDEN);
        }

        // Validate future date for proposals
        if (type === 'date_proposal' && metadata?.scheduledAt) {
            const scheduledTime = new Date(metadata.scheduledAt).getTime();
            if (scheduledTime < Date.now()) {
                throw new AppError("You cannot propose a date in the past.", HTTP_STATUS.BAD_REQUEST);
            }
        }

        const message = await this._messageRepo.createMessage({
            matchId,
            senderId,
            content,
            type,
            metadata
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

        logger.info(`Message sent: From ${senderId} in match ${matchId} (Type: ${type})`);

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

        const userIds = match.users.map((user) => user._id.toString());

        if (!userIds.includes(userId)) {
            throw new AppError("You are not part of this match", HTTP_STATUS.FORBIDDEN);
        }


        const messages = await this._messageRepo.findMessagesByMatchId(matchId, limit);

        return messages.map(msg => MessageMapper.toMessageResponse(msg));


    }

    // ==============================================    
    // Get Matches
    // ==============================================    
    async getMatches(userId: string, page?: number, limit?: number, search?: string): Promise<MatchResponseDto[]> {
        const matches = await this._matchedUsersRepo.findMatchesByUserId(userId, page, limit, search);

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
            const userIds = match.users.map((user) => user._id.toString());
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
    async respondToDateProposal(messageId: string, userId: string, status: 'accepted' | 'declined' | 'suggested', newTime?: string): Promise<MessageResponseDto> {
        const message = await this._messageRepo.findById(messageId);

        if (!message) {
            throw new AppError("Message not found", HTTP_STATUS.NOT_FOUND);
        }

        if (message.type !== 'date_proposal') {
            throw new AppError("Message is not a date proposal", HTTP_STATUS.BAD_REQUEST);
        }

        
        const currentProposalStatus = message.metadata?.proposalStatus || 'pending';

        if (currentProposalStatus === status && status !== 'suggested') {
            return MessageMapper.toMessageResponse(message);
        }

        if (currentProposalStatus === 'pending' && message.senderId.toString() === userId) {
            throw new AppError("You cannot respond to your own proposal", HTTP_STATUS.FORBIDDEN);
        }
        if (currentProposalStatus === 'suggested' && message.metadata?.lastSuggestedBy === userId) {
            throw new AppError("Awaiting response from the other person", HTTP_STATUS.FORBIDDEN);
        }

        const match = await this._matchedUsersRepo.findMatchById(message.matchId.toString());
        if (!match) {
            throw new AppError("Match no longer exists", HTTP_STATUS.NOT_FOUND);
        }

        const userIds = match.users.map(u => u._id.toString());
        if (!userIds.includes(userId)) {
            throw new AppError("You are not part of this conversation", HTTP_STATUS.FORBIDDEN);
        }

        let content = message.content;
        let scheduledAt = message.metadata?.scheduledAt;
        let lastSuggestedBy = message.metadata?.lastSuggestedBy;

        // Handle suggested
        if (status === 'suggested') {
            if (!newTime) {
                throw new AppError("New time required", HTTP_STATUS.BAD_REQUEST);
            }
            scheduledAt = new Date(newTime);
            lastSuggestedBy = userId;

            // Generate new content for the text bubble
            const formattedDate = scheduledAt.toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            content = `Check out this spot: ${message.metadata?.name}! How does ${formattedDate} sound?`;
        }

        // Handle accepted
        if (status === 'accepted') {
            if (!scheduledAt) {
                throw new AppError("No proposed time to accept", HTTP_STATUS.BAD_REQUEST);
            }
        }

        const updatedMetadata: IMessageMetadata = {
            ...message.metadata,
            proposalStatus: status,
            lastSuggestedBy,
            scheduledAt
        };

        const updatedMessage = await this._messageRepo.updateProposal(messageId, content, updatedMetadata, currentProposalStatus);
        if (!updatedMessage) {
            throw new AppError("Failed to update message", HTTP_STATUS.CONFLICT);
        }

        
        const recipientId = userIds.find(id => id !== userId);
        const messageResponse = MessageMapper.toMessageResponse(updatedMessage);

        if (recipientId) {
            this._socketService.sendMessage(recipientId, {
                type: 'date_proposal_updated',
                matchId: message.matchId.toString(),
                message: messageResponse
            });
        }

        logger.info(`Date Proposal: User ${userId} ${status} proposal ${messageId}`);

        return messageResponse;
    }

    async getDateProposals(userId: string, page: number = 1, limit: number = 10): Promise<MessageResponseDto[]> {
        const skip = (page - 1) * limit;
        const messages = await this._messageRepo.findDateProposals(userId, skip, limit);
        return messages.map(msg => MessageMapper.toMessageResponse(msg));
    }
}
