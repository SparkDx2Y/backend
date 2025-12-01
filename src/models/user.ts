import mongoose, { Document }  from "mongoose";


export interface IUser extends Document {
    email: string;
    password: string;
    isVerified: boolean;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}


const userSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
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

export const User = mongoose.model<IUser>('User',userSchema)