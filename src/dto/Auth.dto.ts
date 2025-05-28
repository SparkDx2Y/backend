import { z } from 'zod'

export const signupSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(50, 'Password must be less than 50 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });


export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address'}),
  password: z.string().min(1, 'Password is required')
})

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otp: z.string().min(4, 'OTP must be at least 4 characters'),
});