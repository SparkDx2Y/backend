import { z } from "zod";

export const sendMessageSchema = z.object({
    matchId: z.string().min(1, "Match ID is required"),
    content: z.string().min(1, "Message content is required").max(1000, "Message is too long"),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
