import { z } from "zod";

export const idParamSchema = z.object({
    id: z.string().min(1, "ID is required"),
});

export const createPlanSchema = z.object({
    name: z.string().trim()
        .min(2, { message: "Plan name must be at least 2 characters" })
        .max(30, { message: "Plan name must be less than 30 characters" })
        .regex(/^[a-zA-Z\s]+$/, { message: "Only letters and spaces are allowed" })
        .toUpperCase(),

    price: z.number().min(0, { message: "Price cannot be negative" }).max(20000, { message: "Price cannot exceed 20,000" }),

    durationValue: z.number().min(1, { message: "Duration must be at least 1" }),

    durationUnit: z.enum(['month', 'year']),

    features: z.object({
        seeWhoLikedYou: z.boolean(),
        seeWhoViewedProfile: z.boolean(),
        chatEnabled: z.boolean(),
        dailyMessageLimit: z.number().min(-1, { message: "Message limit cannot be less than -1" }),
        mediaSharingEnabled: z.boolean(),
        audioEnabled: z.boolean(),
        videoCallEnabled: z.boolean(),
        swipeLimit: z.number().min(-1, { message: "Swipe limit cannot be less than -1" }),
    }).refine((f) => {
        const hasActiveToggle = f.seeWhoLikedYou || f.seeWhoViewedProfile || f.chatEnabled || f.mediaSharingEnabled || f.audioEnabled || f.videoCallEnabled;
        const hasNonZeroLimit = f.dailyMessageLimit !== 0 || f.swipeLimit !== 0;
        return hasActiveToggle || hasNonZeroLimit;
    }, {
        message: "Subscription plan must have at least one feature or limit enabled"
    }),

    isActive: z.boolean().default(true),
    isDefaultBasePlan: z.boolean().default(false),

}).refine((data) => {
    if (data.price === 0) return true;
    if (data.durationUnit === 'month') return data.durationValue <= 12;
    if (data.durationUnit === 'year') return data.durationValue <= 10;
    return true;
}, {
    message: "Max 12 months or 10 years allowed",
    path: ["durationValue"]
});

export const updatePlanSchema = createPlanSchema.partial();
