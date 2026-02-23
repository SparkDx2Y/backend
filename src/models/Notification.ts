import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;      // Who receives the notification
    type: 'like' | 'match' | 'message' | 'report_resolved' | 'report_dismissed';   // Type of notification
    fromUserId: mongoose.Types.ObjectId;  // Who triggered the notification
    matchId?: mongoose.Types.ObjectId;    // Related match (if applicable)
    messageId?: mongoose.Types.ObjectId;  // Related message (if applicable)
    isRead: boolean;
    createdAt: Date;
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
        enum: ['like', 'match', 'message', 'report_resolved', 'report_dismissed'],
        required: true
    },
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
