import { Schema, model, Document } from "mongoose";

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
            seeWhoLikedYou: { type: Boolean, default: false },
            seeWhoViewedProfile: { type: Boolean, default: false },
            chatEnabled: { type: Boolean, default: true },

            dailyMessageLimit: {
                type: Number,
                default: 20, 
            },

            mediaSharingEnabled: {
                type: Boolean,
                default: false,
            },

            audioEnabled: {
                type: Boolean,
                default: false,
            },

            videoCallEnabled: {
                type: Boolean,
                default: false,
            },

            swipeLimit: {
                type: Number,
                default: 20, 
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const SubscriptionPlan = model<ISubscriptionPlan>(
    "SubscriptionPlan",
    subscriptionPlanSchema
);
