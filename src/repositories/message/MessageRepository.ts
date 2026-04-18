import { injectable } from "inversify";
import { Message, IMessage } from "../../models/Message";
import { MessageType, IMessageMetadata } from "../../types/message";
import { IMessageRepository } from "./IMessageRepository";
import { Types } from "mongoose";
import { Match } from "../../models/Match";

@injectable()
export class MessageRepository implements IMessageRepository {

    // create a new message
    async createMessage(data: { matchId: string; senderId: string; content: string; type?: MessageType; metadata?: IMessageMetadata }): Promise<IMessage> {
        return Message.create({
            matchId: new Types.ObjectId(data.matchId),
            senderId: new Types.ObjectId(data.senderId),
            content: data.content,
            type: data.type || 'text',
            metadata: data.metadata,
            isRead: false
        });
    }

    // get messages for a match
    async findMessagesByMatchId(matchId: string, limit: number = 50): Promise<IMessage[]> {
        const messages = await Message.find({
            matchId: new Types.ObjectId(matchId)
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();

        return messages.reverse();
    }


    // mark a message as read
    async markAsRead(messageId: string): Promise<void> {
        await Message.findByIdAndUpdate(messageId, {
            isRead: true
        });
    }

    async markMatchMessagesAsRead(matchId: string, userId: string): Promise<void> {
        
        await Message.updateMany(
            {
                matchId: new Types.ObjectId(matchId),
                senderId: { $ne: new Types.ObjectId(userId) },
                isRead: false
            },
            {
                isRead: true
            }
        );
    }

    // find the last message for a match
    async findLastMessageByMatchId(matchId: string): Promise<IMessage | null> {
        return Message.findOne({
            matchId: new Types.ObjectId(matchId)
        })
            .sort({ createdAt: -1 })
            .exec();
    }

    // get unread count for a user
    async getUnreadCount(userId: string): Promise<number> {
        
        const matches = await Match.find({
            users: new Types.ObjectId(userId)
        }).select('_id');

        const matchIds = matches.map(m => m._id);

        
        return Message.countDocuments({
            matchId: { $in: matchIds },
            senderId: { $ne: new Types.ObjectId(userId) },
            isRead: false
        });
    }

    // get today's message count for a user
    async getTodayMessageCount(userId: string): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return Message.countDocuments({
            senderId: new Types.ObjectId(userId),
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).exec();
    }

    async deleteMessage(messageId: string, userId: string): Promise<IMessage | null> {
        return Message.findOneAndDelete({
            _id: new Types.ObjectId(messageId),
            senderId: new Types.ObjectId(userId)
        });
    }

    async findById(messageId: string): Promise<IMessage | null> {
        if (!Types.ObjectId.isValid(messageId)) return null;
        return Message.findById(messageId).exec();
    }

    async updateProposal(messageId: string, content: string, metadata: IMessageMetadata, expectedStatus: string): Promise<IMessage | null> {
        if (!Types.ObjectId.isValid(messageId)) return null;
        return Message.findOneAndUpdate(
            {
                _id: new Types.ObjectId(messageId),
                $or: [
                    { 'metadata.proposalStatus': expectedStatus },
                    { 'metadata.proposalStatus': { $exists: false } }
                ]
            },
            { $set: { content, metadata } },
            { new: true }
        ).exec();
    }

    async findDateProposals(userId: string, skip: number = 0, limit: number = 10): Promise<IMessage[]> {
        const matches = await Match.find({ users: new Types.ObjectId(userId) }).select('_id');
        const matchIds = matches.map(m => m._id);

        return Message.find({
            matchId: { $in: matchIds },
            type: 'date_proposal'
        }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    }

    async findMessagesForReminder(startTime: Date, endTime: Date): Promise<IMessage[]> {
        return Message.find({
            type: 'date_proposal',
            'metadata.proposalStatus': 'accepted',
            'metadata.scheduledAt': { $gte: startTime, $lt: endTime }
        }).exec();
    }
}
