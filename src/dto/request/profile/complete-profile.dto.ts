import { z } from "zod";

export const completeProfileSchema = z.object({
  age: z
    .number()
    .int()
    .min(18, "Age must be at least 18")
    .optional(),

  gender: z
    .enum(["male", "female"])
    .optional(),

  interestedIn: z
    .enum(["male", "female"])
    .optional(),

  photos: z
    .array(z.string().url("Invalid photo URL"))
    .optional(),
});

export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;
