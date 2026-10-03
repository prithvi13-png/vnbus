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
const envBooleanSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off", ""].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean());

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_NAME: z.string().default("Vriddhi Nexus Bus"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  PORT: optionalPositiveIntSchema,
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_PORT: z.coerce.number().int().positive().default(3000),
  REQUEST_BODY_LIMIT: z.string().default("1mb"),
  MAINTENANCE_MODE: envBooleanSchema.default(false),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_TTL: durationSchema.default("15m"),
  JWT_REFRESH_TTL: durationSchema.default("7d"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().int().positive().default(24),
  CORS_ORIGIN: z.string().min(1),
  COOKIE_SECURE: envBooleanSchema.default(false),
  COOKIE_DOMAIN: z.string().optional(),
  EMAIL_PROVIDER: z.string().default("resend"),
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
  SUPPLIER_PRIORITY: z.string().default("SRDV,BCI,ABHIBUS,REDBUS,TBO,CUSTOM"),
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
  // SRDV. All optional: absent credentials leave the supplier unregistered, so
  // searches return no buses rather than failing. SRDV_API_TOKEN is the credential the supplier
  // actually authenticates on, taking the place of the _API_KEY the other
  // suppliers use.
  SRDV_API_URL: z.string().optional(),
  SRDV_API_TOKEN: z.string().optional(),
  // The v9 documentation still shows these on some endpoint examples while
  // describing the newer flow as token-authenticated, so they are optional
  // until an endpoint is confirmed to require them.
  SRDV_CLIENT_ID: z.string().optional(),
  SRDV_USER_NAME: z.string().optional(),
  SRDV_PASSWORD: z.string().optional(),
  /** The whitelisted public IP SRDV ties requests to. */
  SRDV_END_USER_IP: z.string().optional(),
  /**
   * Path between SRDV_API_URL and the operation name. Exists because the docs
   * disagree on where the version sits: with a base of ".../bus" this is
   * "v9/rest"; with ".../bus/v9" it is "rest". Both resolve to the same
   * endpoint, and only a call with a valid token can confirm which base is
   * live, so it is configuration rather than a guess baked into the client.
   */
  SRDV_REST_PATH_PREFIX: z.string().default("v9/rest"),
  /**
   * SRDV addresses cities by numeric code. Its own city list ships with the
   * supplier SDK; this overlays it as "kochi:938,vizag:27" to add or correct a
   * city without a release. Codes must come from SRDV — never inferred from a
   * sample response, where an example pairing proves nothing about which city
   * a code denotes. Unmapped cities are reported as errors rather than guessed.
   */
  SRDV_CITY_CODES: z.string().optional(),
  /**
   * SRDV's own request timeout. Separate from SUPPLIER_REQUEST_TIMEOUT_MS
   * because a consolidator fans out to many operators per search and is far
   * slower than the 3s global default, which would abort every live search.
   * Raising it only here leaves the other suppliers' budgets untouched.
   */
  SRDV_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(20_000),
  CUSTOM_BUS_API_URL: z.string().optional(),
  CUSTOM_BUS_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER: z.string().optional(),
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
  PROMETHEUS_ENABLED: envBooleanSchema.default(true),
  SENTRY_DSN: optionalUrlSchema,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SECURITY_HEADERS_ENABLED: envBooleanSchema.default(true),
  RATE_LIMIT_PUBLIC_PER_MINUTE: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_AUTHENTICATED_PER_MINUTE: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_ADMIN_PER_MINUTE: z.coerce.number().int().positive().default(120),
});

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_MAINTENANCE_MODE: envBooleanSchema.default(false),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;

export function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv {
  return serverEnvSchema.parse(env);
}

export function parseWebEnv(env: NodeJS.ProcessEnv): WebEnv {
  return webEnvSchema.parse(env);
}
