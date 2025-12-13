import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }).trim(),
    password: z.string().min(1, { message: 'Password is required' }).trim(),
})

export type LoginDto = z.infer<typeof loginSchema>;