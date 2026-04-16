import { z } from "zod";

export const sendMessageSchema = z.object({
    matchId: z.string().min(1, "Match ID is required"),
    content: z.string().min(1, "Message content is required"),
    type: z.enum(['text', 'image', 'audio', 'video_call', 'date_proposal']).optional().default('text'),
    metadata: z.object({
        placeId: z.string().optional(),
        name: z.string().optional(),
        address: z.string().optional(),
        rating: z.number().optional(),
        photo: z.string().optional(),
        proposalStatus: z.enum(['pending', 'accepted', 'declined', 'suggested']).optional(),
        lastSuggestedBy: z.string().optional(),
        scheduledAt: z.union([z.string(), z.date()]).optional(),
    }).optional(),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
