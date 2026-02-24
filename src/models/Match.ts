import type { Document} from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IMatch extends Document {
    users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId]; 
    createdAt: Date;
    lastMessageAt?: Date; 
}

const matchSchema = new Schema<IMatch>({
    users: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: true,
        validate: {
            validator: (v: mongoose.Types.ObjectId[]) => v.length === 2,
            message: 'A match must have exactly 2 users'
        }
    },
    lastMessageAt: {
        type: Date,
        default: null
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Sort the users array to ensure consistent ordering
matchSchema.index({ users: 1 });


export const Match = mongoose.model<IMatch>("Match", matchSchema);
