import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { MessageType, IMessageMetadata } from "../types/message";

export interface IMessage extends Document {
    matchId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    type: MessageType;
    metadata?: IMessageMetadata;
    isRead: boolean;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
    matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'audio', 'video_call', 'date_proposal'],
        default: 'text'
    },
    metadata: {
        placeId: String,
        name: String,
        address: String,
        rating: Number,
        photo: String,
        proposalStatus: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'suggested'],
            default: 'pending'
        },
        lastSuggestedBy: String,
        scheduledAt: Date
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Index for efficient message retrieval (get messages for a match, sorted by time)
messageSchema.index({ matchId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
