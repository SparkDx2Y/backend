import mongoose, { Document, Schema } from "mongoose";

export interface IMatchAction {
    _id: mongoose.Types.ObjectId;
    fromUserId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string };
    toUserId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string };
    action: 'like' | 'pass';
    createdAt: Date;
}

const matchActionSchema = new Schema<IMatchAction>({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['like', 'pass'],
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Correcting the index compound definition
matchActionSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

export const MatchAction = mongoose.model<IMatchAction>("MatchAction", matchActionSchema);
