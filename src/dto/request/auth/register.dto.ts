import { z } from "zod";

export const signupSchema = z.object({

    name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(50, { message: 'Name must be less than 50 characters long' }).trim(),

    email: z.email({ message: 'Invalid email address' }).trim(),

    password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(20, { message: 'Password must be less than 20 characters long' })
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    ),
})

export type SignupDto = z.infer<typeof signupSchema>;
