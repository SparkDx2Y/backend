import type { Document } from "mongoose";
import { Schema, model } from "mongoose";

/* ================================
    Features Interface
================================ */

export interface ISubscriptionFeatures {
    seeWhoLikedYou: boolean;
    seeWhoViewedProfile: boolean;
    chatEnabled: boolean;
    dailyMessageLimit: number;
    mediaSharingEnabled: boolean;
    audioEnabled: boolean;
    videoCallEnabled: boolean;
    swipeLimit: number;
}

/* ================================
    Subscription Plan Interface
================================ */

export interface ISubscriptionPlan extends Document {
    name: string;
    price: number;
    durationValue: number;
    durationUnit: 'month' | 'year';
    features: ISubscriptionFeatures;
    isActive: boolean;
    isDefaultBasePlan: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/* ================================
    Schema
================================ */

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        durationValue: {
            type: Number,
            required: true,
            min: 1,
        },

        durationUnit: {
            type: String,
            enum: ['month', 'year'],
            required: true,
        },

        features: {
            seeWhoLikedYou: { type: Boolean, required: true },
            seeWhoViewedProfile: { type: Boolean, required: true },
            chatEnabled: { type: Boolean, required: true },

            dailyMessageLimit: {
                type: Number,
                required: true,
            },

            mediaSharingEnabled: {
                type: Boolean,
                required: true,
            },

            audioEnabled: {
                type: Boolean,
                required: true,
            },

            videoCallEnabled: {
                type: Boolean,
                required: true,
            },

            swipeLimit: {
                type: Number,
                required: true,
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDefaultBasePlan: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const SubscriptionPlan = model<ISubscriptionPlan>(
    "SubscriptionPlan",
    subscriptionPlanSchema
);
