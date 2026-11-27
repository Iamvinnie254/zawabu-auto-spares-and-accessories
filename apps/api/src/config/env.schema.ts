import { z } from "zod";

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().max(65535).default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters")
      .default("dev-only-secret-change-me-before-production"),
    JWT_EXPIRES_IN: z.string().min(1).default("1d"),
    BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
    SUPER_ADMIN_EMAIL: z.email().default("superadmin@zawabu.co.ke"),
    SUPER_ADMIN_PASSWORD: z.string().min(12).default("ChangeMe!SuperAdmin2026"),
    CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
    CORS_ORIGINS: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production") {
      if (env.JWT_SECRET.includes("dev-only")) {
        ctx.addIssue({
          code: "custom",
          path: ["JWT_SECRET"],
          message: "Set a real JWT_SECRET in production",
        });
      }
      if (env.SUPER_ADMIN_PASSWORD.includes("ChangeMe")) {
        ctx.addIssue({
          code: "custom",
          path: ["SUPER_ADMIN_PASSWORD"],
          message: "Set a real SUPER_ADMIN_PASSWORD in production",
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
