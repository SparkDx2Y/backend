import type { Document } from "mongoose";
import mongoose from "mongoose";


export interface IUser extends Document {
    name: string;
    email: string;
    googleId?: string;
    password?: string;
    isVerified: boolean;
    role: 'user' | 'admin';
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

userSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 3600, partialFilterExpression: { isVerified: false, role: 'user' } }
)

export const User = mongoose.model<IUser>('User', userSchema)