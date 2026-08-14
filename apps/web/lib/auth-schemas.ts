import { z } from "zod";

const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/u, {
  message: "Enter a valid phone number",
});

const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(128, "Use 128 characters or fewer")
  .regex(/[a-z]/u, "Add a lowercase letter")
  .regex(/[A-Z]/u, "Add an uppercase letter")
  .regex(/\d/u, "Add a number")
  .regex(/[^A-Za-z\d]/u, "Add a special character");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(12, "Enter your password"),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter a first name").max(80),
    lastName: z.string().trim().min(1, "Enter a last name").max(80),
    email: z.string().trim().email("Enter a valid email"),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(12, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32, "Enter the reset token"),
    password: passwordSchema,
    confirmPassword: z.string().min(12, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(32, "Enter the verification token"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(12, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(12, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Enter a first name").max(80),
  lastName: z.string().trim().min(1, "Enter a last name").max(80),
  phone: phoneSchema,
  avatar: z.string().trim().max(2048).optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
