import { z } from "zod";

export const completeProfileSchema = z.object({
  age: z
    .number()
    .int()
    .min(18, "Age must be at least 18")
    .max(50, 'age cannot more than 50'),

  gender: z
    .enum(["male", "female"]),

  interestedIn: z
    .enum(["male", "female"]),

  profilePhoto: z
    .string()
    .url("Invalid photo URL")
    .min(1, "Profile photo is required"),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
});

export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;
