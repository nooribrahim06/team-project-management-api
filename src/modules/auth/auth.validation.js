import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.email(),
    name: z.string().trim().min(2).max(100),
    password: z.string().min(8).max(72),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/i),
  })
  .strict();

export const resendVerificationSchema = z
  .object({
    email: z.email(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(72),
  })
  .strict();
