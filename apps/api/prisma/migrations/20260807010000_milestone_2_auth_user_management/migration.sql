-- Milestone 2: Authentication, user management, database-driven RBAC, and activity metadata.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Make role codes data-driven so new roles do not require Prisma enum migrations.
ALTER TABLE "roles" ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "roles" ALTER COLUMN "code" TYPE VARCHAR(80) USING "code"::text;
DROP TYPE IF EXISTS "RoleCode";

UPDATE "roles"
SET "code" = 'TRAVEL_AGENT',
    "name" = 'Travel Agent',
    "description" = 'Travel Agent role',
    "is_system" = true
WHERE "code" = 'AGENT';

UPDATE "roles"
SET "is_system" = true
WHERE "code" IN ('CUSTOMER', 'TRAVEL_AGENT', 'ADMIN');

INSERT INTO "roles" ("id", "code", "name", "description", "is_system", "created_at", "updated_at")
SELECT gen_random_uuid(), 'CUSTOMER', 'Customer', 'Customer role', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "code" = 'CUSTOMER');

INSERT INTO "roles" ("id", "code", "name", "description", "is_system", "created_at", "updated_at")
SELECT gen_random_uuid(), 'TRAVEL_AGENT', 'Travel Agent', 'Travel Agent role', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "code" = 'TRAVEL_AGENT');

INSERT INTO "roles" ("id", "code", "name", "description", "is_system", "created_at", "updated_at")
SELECT gen_random_uuid(), 'ADMIN', 'Admin', 'Admin role', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "code" = 'ADMIN');

-- Enrich users with profile, primary role, soft-delete, and forced password-change fields.
ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password";
ALTER TABLE "users" ADD COLUMN "first_name" VARCHAR(80);
ALTER TABLE "users" ADD COLUMN "last_name" VARCHAR(80);
ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN "role_id" UUID;
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "force_password_change" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "deleted_at" TIMESTAMP(3);

UPDATE "users" AS "u"
SET "first_name" = COALESCE(NULLIF(split_part("c"."full_name", ' ', 1), ''), 'User'),
    "last_name" = COALESCE(NULLIF(split_part("c"."full_name", ' ', 2), ''), 'Account'),
    "phone" = COALESCE("c"."phone", "u"."phone")
FROM "customers" AS "c"
WHERE "c"."user_id" = "u"."id";

WITH numbered AS (
  SELECT "id", row_number() OVER (ORDER BY "id") AS "rn"
  FROM "users"
  WHERE "phone" IS NULL
)
UPDATE "users" AS "u"
SET "phone" = '+910000' || lpad("numbered"."rn"::text, 6, '0')
FROM "numbered"
WHERE "u"."id" = "numbered"."id";

UPDATE "users"
SET "first_name" = COALESCE("first_name", 'User'),
    "last_name" = COALESCE("last_name", 'Account'),
    "email_verified" = CASE
      WHEN "email_verified_at" IS NOT NULL OR "status" = 'ACTIVE' THEN true
      ELSE false
    END;

UPDATE "users" AS "u"
SET "role_id" = "role_source"."role_id"
FROM (
  SELECT DISTINCT ON ("user_id") "user_id", "role_id"
  FROM "user_roles"
  ORDER BY "user_id", "role_id"
) AS "role_source"
WHERE "u"."id" = "role_source"."user_id";

UPDATE "users"
SET "role_id" = (SELECT "id" FROM "roles" WHERE "code" = 'CUSTOMER' LIMIT 1)
WHERE "role_id" IS NULL;

ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;

-- Add refresh-token rotation metadata and request fingerprints.
ALTER TABLE "refresh_tokens" ADD COLUMN "token_family" UUID;
ALTER TABLE "refresh_tokens" ADD COLUMN "replaced_by_token_id" UUID;
ALTER TABLE "refresh_tokens" ADD COLUMN "ip_address" VARCHAR(80);
ALTER TABLE "refresh_tokens" ADD COLUMN "user_agent" TEXT;

UPDATE "refresh_tokens"
SET "token_family" = gen_random_uuid()
WHERE "token_family" IS NULL;

ALTER TABLE "refresh_tokens" ALTER COLUMN "token_family" SET NOT NULL;

ALTER TABLE "password_reset_tokens" ADD COLUMN "ip_address" VARCHAR(80);
ALTER TABLE "password_reset_tokens" ADD COLUMN "user_agent" TEXT;

ALTER TABLE "email_verification_tokens" ADD COLUMN "ip_address" VARCHAR(80);
ALTER TABLE "email_verification_tokens" ADD COLUMN "user_agent" TEXT;

ALTER TABLE "activity_logs" ADD COLUMN "ip_address" VARCHAR(80);
ALTER TABLE "activity_logs" ADD COLUMN "user_agent" TEXT;
ALTER TABLE "activity_logs" ADD COLUMN "request_id" VARCHAR(120);

-- Indexes and primary-role relation.
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE INDEX "users_role_id_idx" ON "users"("role_id");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");
CREATE INDEX "refresh_tokens_token_family_idx" ON "refresh_tokens"("token_family");

ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey"
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
