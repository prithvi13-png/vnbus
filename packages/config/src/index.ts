import { z } from "zod";

const durationSchema = z.string().regex(/^\d+(s|m|h|d)$/u);
const optionalUrlSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);
const optionalPositiveIntSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_NAME: z.string().default("Vriddhi Nexus Bus"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_PORT: z.coerce.number().int().positive().default(3000),
  REQUEST_BODY_LIMIT: z.string().default("1mb"),
  MAINTENANCE_MODE: z.coerce.boolean().default(false),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_TTL: durationSchema.default("15m"),
  JWT_REFRESH_TTL: durationSchema.default("7d"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().int().positive().default(24),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_DOMAIN: z.string().optional(),
  EMAIL_PROVIDER: z.string().default("mock"),
  EMAIL_FROM: z.string().email().default("no-reply@vriddhinexus.example"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: optionalPositiveIntSchema,
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  SUPPLIER_MODE: z.enum(["mock", "production"]).default("mock"),
  SUPPLIER_PRIORITY: z.string().default("MOCK,BCI,ABHIBUS,REDBUS,TBO,CUSTOM"),
  SUPPLIER_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(1500),
  SUPPLIER_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),
  SUPPLIER_RETRY_COUNT: z.coerce.number().int().min(0).default(1),
  SUPPLIER_RETRY_DELAY_MS: z.coerce.number().int().positive().default(150),
  SUPPLIER_CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().positive().default(3),
  SUPPLIER_CIRCUIT_BREAKER_COOLDOWN_MS: z.coerce.number().int().positive().default(30_000),
  BCI_API_URL: z.string().optional(),
  BCI_API_KEY: z.string().optional(),
  REDBUS_API_URL: z.string().optional(),
  REDBUS_API_KEY: z.string().optional(),
  ABHIBUS_API_URL: z.string().optional(),
  ABHIBUS_API_KEY: z.string().optional(),
  TBO_API_URL: z.string().optional(),
  TBO_API_KEY: z.string().optional(),
  CUSTOM_BUS_API_URL: z.string().optional(),
  CUSTOM_BUS_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER: z.string().default("MOCK"),
  PAYMENT_API_KEY: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_API_URL: z.string().optional(),
  RAZORPAY_API_KEY: z.string().optional(),
  CASHFREE_API_URL: z.string().optional(),
  CASHFREE_API_KEY: z.string().optional(),
  PHONEPE_API_URL: z.string().optional(),
  PHONEPE_API_KEY: z.string().optional(),
  STRIPE_API_URL: z.string().optional(),
  STRIPE_API_KEY: z.string().optional(),
  CUSTOM_PAYMENT_API_URL: z.string().optional(),
  CUSTOM_PAYMENT_API_KEY: z.string().optional(),
  AI_PROVIDER: z.string().default("none"),
  AI_API_KEY: z.string().optional(),
  MONITORING_PROVIDER: z.string().default("prometheus"),
  PROMETHEUS_ENABLED: z.coerce.boolean().default(true),
  SENTRY_DSN: optionalUrlSchema,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SECURITY_HEADERS_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_PUBLIC_PER_MINUTE: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_AUTHENTICATED_PER_MINUTE: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_ADMIN_PER_MINUTE: z.coerce.number().int().positive().default(120),
});

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_MAINTENANCE_MODE: z.coerce.boolean().default(false),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;

export function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv {
  return serverEnvSchema.parse(env);
}

export function parseWebEnv(env: NodeJS.ProcessEnv): WebEnv {
  return webEnvSchema.parse(env);
}
