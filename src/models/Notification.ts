import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { IUser } from "./user";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'like' | 'match' | 'message' | 'report_resolved' | 'report_dismissed' | 'profile_view' | 'subscription_expired' | 'subscription_expiring_soon' | 'date_reminder';
    fromUserId?: mongoose.Types.ObjectId;
    matchId?: mongoose.Types.ObjectId;
    messageId?: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
}

export interface INotificationPopulated extends Omit<INotification, 'fromUserId'> {
    fromUserId: IUser & { profilePhoto?: string };
}

const notificationSchema = new Schema<INotification>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['like', 'match', 'message', 'report_resolved', 'report_dismissed', 'profile_view', 'subscription_expired', 'subscription_expiring_soon', 'date_reminder'],
        required: true
    },
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        default: null
    },
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Compound index for efficient notification queries (get unread notifications for a user)
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
