import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IProfileView extends Document {
    viewerId: mongoose.Types.ObjectId;
    viewedId: mongoose.Types.ObjectId;
    lastViewedAt: Date;
}

const profileViewSchema = new Schema<IProfileView>({
    viewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    viewedId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    lastViewedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { timestamps: false });


profileViewSchema.index({ viewerId: 1, viewedId: 1 }, { unique: true });

profileViewSchema.index({ viewedId: 1, lastViewedAt: -1 });

export const ProfileView = mongoose.model<IProfileView>("ProfileView", profileViewSchema);
