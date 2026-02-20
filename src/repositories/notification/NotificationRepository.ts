import { injectable } from "inversify";
import { Notification, INotification } from "../../models/Notification";
import { Profile } from "../../models/profile";
import { INotificationRepository } from "./INotificationRepository";

import { Types } from "mongoose";

type profileUser = {
    _id: Types.ObjectId;
    name: string;
    profilePhoto?: string;
}

@injectable()
export class NotificationRepository implements INotificationRepository {

    // create a new notification
    async create(data: { userId: string; type: 'like' | 'match' | 'message' | 'report_resolved' | 'report_dismissed'; fromUserId: string; matchId?: string; messageId?: string; }): Promise<INotification> {
        return Notification.create({
            userId: new Types.ObjectId(data.userId),
            type: data.type,
            fromUserId: new Types.ObjectId(data.fromUserId),
            matchId: data.matchId ? new Types.ObjectId(data.matchId) : null,
            messageId: data.messageId ? new Types.ObjectId(data.messageId) : null,
            isRead: false
        });
    }

    // find notifications by user id
    async findByUserId(userId: string, limit: number = 20): Promise<INotification[]> {
        const notifications = await Notification.find({
            userId: new Types.ObjectId(userId)
        })
            .populate('fromUserId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();

        const fromUserIds = notifications.map(n => n.fromUserId?._id).filter(Boolean);
        const profiles = await Profile.find({ userId: { $in: fromUserIds } }).select('userId profilePhoto').lean();

        const profileMap = new Map();
        profiles.forEach(p => profileMap.set(p.userId.toString(), p.profilePhoto));

        notifications.forEach(n => {
            const user = n.fromUserId as unknown as profileUser | null;
            if (user) {
                user.profilePhoto = profileMap.get(user._id.toString());
            }
        });

        return notifications as unknown as INotification[];
    }

    // find unread notifications by user id
    async findUnreadByUserId(userId: string): Promise<INotification[]> {

        const notifications = await Notification.find({
            userId: new Types.ObjectId(userId),
            isRead: false
        })
            .populate('fromUserId', 'name')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const fromUserIds = notifications.map(n => n.fromUserId?._id).filter(Boolean);
        const profiles = await Profile.find({ userId: { $in: fromUserIds } }).select('userId profilePhoto').lean();

        const profileMap = new Map();
        profiles.forEach(p => profileMap.set(p.userId.toString(), p.profilePhoto));

        notifications.forEach(n => {
            const user = n.fromUserId as unknown as profileUser | null;
            if (user) {
                user.profilePhoto = profileMap.get(user._id.toString());
            }
        });

        return notifications as unknown as INotification[];
    }

    // mark notification as read
    async markAsRead(notificationId: string): Promise<void> {
        await Notification.findByIdAndUpdate(notificationId, {
            isRead: true
        });
    }

    // mark all notifications as read
    async markAllAsRead(userId: string): Promise<void> {
        await Notification.updateMany(
            {
                userId: new Types.ObjectId(userId),
                isRead: false
            },
            {
                isRead: true
            }
        );
    }

    // get unread count
    async getUnreadCount(userId: string): Promise<number> {
        return Notification.countDocuments({
            userId: new Types.ObjectId(userId),
            isRead: false
        });
    }
}
