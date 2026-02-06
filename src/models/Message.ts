import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
    matchId: mongoose.Types.ObjectId;  // Which match this message belongs to
    senderId: mongoose.Types.ObjectId; // Who sent the message
    content: string;                   // Message text
    isRead: boolean;                   // Has the recipient read it?
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
        trim: true,
        maxlength: 1000
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Index for efficient message retrieval (get messages for a match, sorted by time)
messageSchema.index({ matchId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
