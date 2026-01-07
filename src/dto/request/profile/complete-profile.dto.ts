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
    .optional(),

  coverPhoto: z
    .string()
    .url("Invalid photo URL")
    .optional(),

  photos: z
    .array(z.string().url("Invalid photo URL"))
    .min(2, "Please upload at least 2 photos")
    .max(6, "Please upload a maximum of 6 photos")
});

export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;
