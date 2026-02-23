import { injectable } from "inversify";
import { Message, IMessage } from "../../models/Message";
import { IMessageRepository } from "./IMessageRepository";
import { Types } from "mongoose";
import { Match } from "../../models/Match";

@injectable()
export class MessageRepository implements IMessageRepository {

    // create a new message
    async createMessage(data: { matchId: string; senderId: string; content: string; type?: string }): Promise<IMessage> {

        return Message.create({
            matchId: new Types.ObjectId(data.matchId),
            senderId: new Types.ObjectId(data.senderId),
            content: data.content,
            type: data.type || 'text',
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


    async markAsRead(messageId: string): Promise<void> {
        await Message.findByIdAndUpdate(messageId, {
            isRead: true
        });
    }

    async markMatchMessagesAsRead(matchId: string, userId: string): Promise<void> {
        // Mark all messages in this match that were NOT sent by userId as read
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

    async findLastMessageByMatchId(matchId: string): Promise<IMessage | null> {
        return Message.findOne({
            matchId: new Types.ObjectId(matchId)
        })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getUnreadCount(userId: string): Promise<number> {
        // Get all matches for this user
        const matches = await Match.find({
            users: new Types.ObjectId(userId)
        }).select('_id');

        const matchIds = matches.map(m => m._id);

        // Count unread messages in these matches that were NOT sent by this user
        return Message.countDocuments({
            matchId: { $in: matchIds },
            senderId: { $ne: new Types.ObjectId(userId) },
            isRead: false
        });
    }

    async deleteMessage(messageId: string, userId: string): Promise<IMessage | null> {
        return Message.findOneAndDelete({
            _id: new Types.ObjectId(messageId),
            senderId: new Types.ObjectId(userId)
        });
    }
}
