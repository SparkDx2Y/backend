import { z } from "zod";

export const updateProfileSchema = z.object({
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

  profilePhoto: z
    .string()
    .url("Invalid image URL")
    .optional(),

  coverPhoto: z
    .string()
    .url("Invalid image URL")
    .optional(),

  photos: z
    .array(z.string().url("Invalid photo URL"))
    .min(1, "Please upload at least 1 photo")
    .max(6, "Please upload a maximum of 6 photos")
    .optional(),
}).refine(
  (data) =>
    data.age !== undefined ||
    data.gender !== undefined ||
    data.interestedIn !== undefined ||
    data.profilePhoto !== undefined ||
    data.coverPhoto !== undefined ||
    data.photos !== undefined,
  { message: "At least one field must be provided to update the profile" }
);

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

