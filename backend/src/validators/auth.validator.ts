import { z } from 'zod';

// ===============================
// REGISTER
// ===============================
export const registerSchema = z
  .object({
    body: z.object({
      firstName: z
        .string()
        .min(2, 'First name must contain at least 2 characters')
        .max(100),

      lastName: z
        .string()
        .min(2, 'Last name must contain at least 2 characters')
        .max(100),

      username: z
        .string()
        .min(3, 'Username must contain at least 3 characters')
        .max(100)
        .regex(
          /^[a-zA-Z0-9._-]+$/,
          'Username can only contain letters, numbers, dots, underscores and hyphens'
        ),

      email: z
        .string()
        .email('Invalid email address')
        .max(150),

      phone: z
        .string()
        .min(7, 'Invalid phone number')
        .max(30)
        .optional(),

      password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),

      confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    }),
  })
  .refine(
    (data) => data.body.password === data.body.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['body', 'confirmPassword'],
    }
  );


// ===============================
// LOGIN
// ===============================
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address'),

    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});


// ===============================
// REFRESH TOKEN
// ===============================
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token is required'),
  }),
});


// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address'),
  }),
});


// ===============================
// RESET PASSWORD
// ===============================
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, 'Reset token is required'),

    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  }),
});