import type { Document , Types } from "mongoose";
import  { Schema, model } from "mongoose";

export interface IUserSubscription extends Document {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: "ACTIVE" | "EXPIRED" | "UPGRADED";
    createdAt: Date;
    updatedAt: Date;
}

const userSubscriptionSchema = new Schema<IUserSubscription>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        planId: {
            type: Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "UPGRADED"],
            default: "ACTIVE",
        },
    },
    { timestamps: true }
);

export const UserSubscription = model<IUserSubscription>("UserSubscription", userSubscriptionSchema);
