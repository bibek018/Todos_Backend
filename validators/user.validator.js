import { z } from "zod";
export const signupSchema = z.object({
  name: z.string().min(3, "Name must be minimum of 3 letters."),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be minimum of length 8"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be of minimum length 8"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmNewPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });