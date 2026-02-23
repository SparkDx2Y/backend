import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose'

export interface IInterest extends Document {
    name: string;
    categoryId: Types.ObjectId
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const interestSchema = new Schema<IInterest>({
    name: {
        type: String,
        required: true,
        trim: true
    },

    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'InterestCategory',
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

interestSchema.index({ name: 1, categoryId: 1 }, { unique: true })

export const Interest = mongoose.model<IInterest>('Interest', interestSchema)
