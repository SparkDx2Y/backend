import { z } from "zod";

export const swipeActionSchema = z.object({
  targetId: z.string().min(1, "Target user id is required"),
  action: z.enum(["like", "pass"]),
});

export type SwipeActionDto = z.infer<typeof swipeActionSchema>;
