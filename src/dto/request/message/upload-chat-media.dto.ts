import { z } from "zod";
import { ChatMediaType } from '../../../types/common'

export const uploadChatMediaSchema = z.object({
    type: z.enum(['image', 'audio'], {
        message: "Invalid media type. Must be 'image' or 'audio'"
    }),
});

export type UploadChatMediaDto = z.infer<typeof uploadChatMediaSchema>;
