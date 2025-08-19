import { z } from 'zod';

// Custom email validation regex (more comprehensive than deprecated .email())
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Password validation regex (at least one uppercase, one lowercase, one number, one special char)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Username validation (alphanumeric and underscore only)
const usernameRegex = /^[a-zA-Z0-9_]+$/;

// Name validation (letters, spaces, hyphens, and apostrophes only)
const nameRegex = /^[a-zA-Z\s\-']+$/;

export const registerRequestSchema = z.object({
    body: z.object({
        email: z.string()
            .min(1, 'Email is required')
            .max(254, 'Email must not exceed 254 characters')
            .regex(emailRegex, 'Please enter a valid email address')
            .transform(val => val.toLowerCase().trim())
            .refine(val => !val.includes('..'), 'Email cannot contain consecutive dots')
            .refine(val => !val.startsWith('.') && !val.endsWith('.'), 'Email cannot start or end with a dot'),

        password: z.string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
            .refine(val => !val.includes(' '), 'Password cannot contain spaces')
            .refine(val => !/(.)\1{2,}/.test(val), 'Password cannot contain more than 2 consecutive identical characters'),

        firstName: z.string()
            .min(1, 'First name is required')
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must not exceed 50 characters')
            .regex(nameRegex, 'First name can only contain letters, spaces, hyphens, and apostrophes')
            .transform(val => val.trim())
            .refine(val => val.split(' ').every(word => word.length > 0), 'First name cannot contain multiple consecutive spaces'),

        lastName: z.string()
            .min(1, 'Last name is required')
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must not exceed 50 characters')
            .regex(nameRegex, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
            .transform(val => val.trim())
            .refine(val => val.split(' ').every(word => word.length > 0), 'Last name cannot contain multiple consecutive spaces'),

    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

export const verifEmailRequestSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
        token: z.string()
    }),
})

export const loginRequestSchema = z.object({
    body: z.object({
        email: z.string()
            .min(1, 'Email is required')
            .max(254, 'Email must not exceed 254 characters')
            .regex(emailRegex, 'Please enter a valid email address')
            .transform(val => val.toLowerCase().trim()),

        password: z.string()
            .min(1, 'Password is required')
            .max(128, 'Password must not exceed 128 characters'),

        // Optional remember me
        rememberMe: z.boolean().optional().default(false),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

export const refreshRequestSchema = z.object({
    body: z.object({
        refreshToken: z.string()
            .min(1, 'Refresh token is required')
            .min(20, 'Invalid refresh token format')
            .max(500, 'Refresh token too long')
            .refine(val => !/\s/.test(val), 'Refresh token cannot contain spaces'),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

// Password reset request schema
export const forgotPasswordRequestSchema = z.object({
    body: z.object({
        email: z.string()
            .min(1, 'Email is required')
            .max(254, 'Email must not exceed 254 characters')
            .regex(emailRegex, 'Please enter a valid email address')
            .transform(val => val.toLowerCase().trim()),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

// Password reset schema
export const resetPasswordRequestSchema = z.object({
    body: z.object({
        token: z.string()
            .min(1, 'Reset token is required')
            .min(20, 'Invalid reset token format'),

        newPassword: z.string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
            .refine(val => !val.includes(' '), 'Password cannot contain spaces'),

        confirmPassword: z.string(),
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

// Change password schema (for authenticated users)
export const changePasswordRequestSchema = z.object({
    body: z.object({
        currentPassword: z.string()
            .min(1, 'Current password is required'),

        newPassword: z.string()
            .min(8, 'New password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
            .refine(val => !val.includes(' '), 'Password cannot contain spaces'),

        confirmPassword: z.string(),
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }).refine(data => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

export const logoutRequestSchema = z.object({
    body: z.object({
        refreshToken: z.string()
            .min(1, 'Refresh token is required')
            .min(20, 'Invalid refresh token format')
            .max(500, 'Refresh token too long')
            .refine(val => !/\s/.test(val), 'Refresh token cannot contain spaces'),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});


// Export types for TypeScript
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type VerifEmailRequest = z.infer<typeof verifEmailRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;