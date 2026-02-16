import { z } from "zod";

export const sendMessageSchema = z.object({
    matchId: z.string().min(1, "Match ID is required"),
    content: z.string().min(1, "Message content is required").max(2000, "Message is too long"),
    type: z.enum(['text', 'image', 'audio']).optional().default('text'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
