import mongoose, { Document, Schema } from "mongoose";

export interface IInterestCategory extends Document {
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const interestCategorySchema = new Schema<IInterestCategory>({
    name: {
        type: String,
        required: true,
        unique:true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const InterestCategory = mongoose.model<IInterestCategory>("InterestCategory", interestCategorySchema);
