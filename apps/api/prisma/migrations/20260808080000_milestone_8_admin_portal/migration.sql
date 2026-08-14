-- Milestone 8: Enterprise admin portal persistence model.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AGENT_BOOKING_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AGENT_BOOKING_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AGENT_JOURNEY_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AGENT_SYSTEM';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ADMIN_BROADCAST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ADMIN_CUSTOMER_MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ADMIN_AGENT_MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ADMIN_SYSTEM';

CREATE TABLE IF NOT EXISTS "cms_pages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(120) NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "section" VARCHAR(80) NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
  "content" TEXT NOT NULL,
  "seo_title" VARCHAR(180),
  "seo_description" TEXT,
  "updated_by_id" UUID,
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cms_pages_key_key" ON "cms_pages"("key");
CREATE INDEX IF NOT EXISTS "cms_pages_section_status_idx" ON "cms_pages"("section", "status");

CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "metric_key" VARCHAR(120) NOT NULL,
  "period" VARCHAR(40) NOT NULL,
  "points" JSONB NOT NULL DEFAULT '[]',
  "summary" JSONB NOT NULL DEFAULT '{}',
  "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "analytics_snapshots_metric_key_period_snapshot_at_idx"
  ON "analytics_snapshots"("metric_key", "period", "snapshot_at");

CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(120) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "audience" VARCHAR(80) NOT NULL DEFAULT 'GLOBAL',
  "rollout_percentage" INTEGER NOT NULL DEFAULT 0,
  "owner" VARCHAR(120) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_key" ON "feature_flags"("key");
CREATE INDEX IF NOT EXISTS "feature_flags_enabled_audience_idx"
  ON "feature_flags"("enabled", "audience");

CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(120) NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "label" VARCHAR(160) NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "is_secret_reference" BOOLEAN NOT NULL DEFAULT false,
  "updated_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_settings_key_key" ON "platform_settings"("key");
CREATE INDEX IF NOT EXISTS "platform_settings_category_idx" ON "platform_settings"("category");

CREATE TABLE IF NOT EXISTS "supplier_configurations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(40) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "health_status" VARCHAR(40) NOT NULL DEFAULT 'DISABLED',
  "environment" VARCHAR(80) NOT NULL DEFAULT 'MOCK',
  "api_key_secret_ref" TEXT,
  "configuration" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "supplier_configurations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_configurations_code_key"
  ON "supplier_configurations"("code");
CREATE INDEX IF NOT EXISTS "supplier_configurations_enabled_priority_idx"
  ON "supplier_configurations"("enabled", "priority");

CREATE TABLE IF NOT EXISTS "monitoring_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "component" VARCHAR(120) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "latency_ms" INTEGER NOT NULL DEFAULT 0,
  "uptime_percentage" DECIMAL(5,2) NOT NULL DEFAULT 100,
  "details" JSONB NOT NULL DEFAULT '{}',
  "sampled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "monitoring_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "monitoring_snapshots_component_sampled_at_idx"
  ON "monitoring_snapshots"("component", "sampled_at");
CREATE INDEX IF NOT EXISTS "monitoring_snapshots_status_idx"
  ON "monitoring_snapshots"("status");
