import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { IInterest } from "./interest";
import type { IUser } from "./user";

export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    age?: number;
    gender: 'male' | 'female';
    interestedIn?: 'male' | 'female';
    interests: mongoose.Types.ObjectId[];
    location?: {
        type: 'Point',
        coordinates: [number, number]
    }
    profilePhoto?: string | null;
    coverPhoto?: string | null;
    photos?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IProfilePopulated extends Omit<IProfile, 'userId' | 'interests'> {
    userId: IUser;
    interests: IInterest[];
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
        min: 18,
        max: 50,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    interestedIn: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    interests: {
        type: [Schema.Types.ObjectId],
        ref: 'Interest',
        default: []
    },
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    profilePhoto: {
        type: String,
        default: null
    },
    coverPhoto: {
        type: String,
        default: null
    },
    photos: {
        type: [String],
        default: []
    }
}, { timestamps: true })

profileSchema.index({ gender: 1, interestedIn: 1 });

// Geo 
profileSchema.index({ location: "2dsphere" });

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);