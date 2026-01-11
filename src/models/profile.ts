import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    age?: number;
    gender: 'male' | 'female';
    interestedIn?: 'male' | 'female';
    photos?: string[];
    createdAt: Date;
    updatedAt: Date;
}


const profileSchema = new Schema<IProfile>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    interestedIn: {
        type: String,
        enum: ['male', 'female']
    },
    photos: {
        type: [String],
        default: []
    }
}, { timestamps: true })

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);