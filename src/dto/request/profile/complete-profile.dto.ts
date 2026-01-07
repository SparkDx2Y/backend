import { z } from "zod";

export const completeProfileSchema = z.object({
  age: z
    .number()
    .int()
    .min(18, "Age must be at least 18"),

  gender: z
    .enum(["male", "female"]),

  interestedIn: z
    .enum(["male", "female"]),

  profilePhoto: z
    .string()
    .url("Invalid photo URL")
    .min(1, "Profile photo is required"),
});

export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;
