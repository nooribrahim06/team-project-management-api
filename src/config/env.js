import "dotenv/config";
import { z } from "zod";

const developmentSecret = Buffer.alloc(32, 7).toString("base64url");

const jwtSecretSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/, "ACCESS_TOKEN_SECRET must be base64url.")
  .refine(
    (value) => Buffer.from(value, "base64url").length >= 32,
    "ACCESS_TOKEN_SECRET must contain at least 32 bytes.",
  );

const durationInDays = (defaultValue) =>
  z
    .string()
    .trim()
    .regex(/^\d+d$/, "Duration must use days, for example 7d.")
    .default(defaultValue)
    .transform((value) => Number(value.slice(0, -1)));

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().min(1).default("localhost"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\//),
    FRONTEND_URL: z.url().default("http://localhost:5173"),
    ACCESS_TOKEN_SECRET: z.preprocess(
      (value) => (value === "" ? undefined : value),
      jwtSecretSchema.default(developmentSecret),
    ),
    ACCESS_TOKEN_EXPIRATION: z
      .string()
      .trim()
      .regex(/^\d+(?:ms|s|m|h|d)$/)
      .default("15m"),
    REFRESH_TOKEN_EXPIRATION: durationInDays("7d"),
    SESSION_EXPIRATION: durationInDays("30d"),
    EMAIL_USER: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.email().optional(),
    ),
    EMAIL_APP_PASSWORD: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).optional(),
    ),
  })
  .superRefine((values, context) => {
    if (
      values.NODE_ENV === "production" &&
      values.ACCESS_TOKEN_SECRET === developmentSecret
    ) {
      context.addIssue({
        code: "custom",
        path: ["ACCESS_TOKEN_SECRET"],
        message: "A unique production secret is required.",
      });
    }

    if (
      values.NODE_ENV === "production" &&
      (!values.EMAIL_USER || !values.EMAIL_APP_PASSWORD)
    ) {
      context.addIssue({
        code: "custom",
        path: ["EMAIL_USER"],
        message: "Production email credentials are required.",
      });
    }
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    result.error.flatten().fieldErrors,
  );
  throw new Error("Environment validation failed.");
}

export const env = result.data;
