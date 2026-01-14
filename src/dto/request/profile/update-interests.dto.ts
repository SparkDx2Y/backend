import { z } from "zod";

export const updateInterestsSchema = z.object({
    interests: z.array(z.string()).min(1, "Please select at least one interest")
});

export type UpdateInterestsDto = z.infer<typeof updateInterestsSchema>;
