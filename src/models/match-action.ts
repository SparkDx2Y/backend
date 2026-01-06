import mongoose, { Document, Schema } from "mongoose";

export interface IMatchAction extends Document {
    actorId: mongoose.Types.ObjectId;   // The user performing the action
    targetId: mongoose.Types.ObjectId;  // The user being acted upon
    action: 'like' | 'pass';
    createdAt: Date;
}

const matchActionSchema = new Schema<IMatchAction>({
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetId: {
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
matchActionSchema.index({ actorId: 1, targetId: 1 }, { unique: true });

export const MatchAction = mongoose.model<IMatchAction>("MatchAction", matchActionSchema);
