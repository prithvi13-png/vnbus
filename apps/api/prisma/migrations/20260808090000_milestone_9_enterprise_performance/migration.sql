-- Milestone 9: Enterprise performance, cache, queue, AI, SEO, monitoring, and observability persistence model.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_RESCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOURNEY_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PASSWORD_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WELCOME';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ADMIN_ANNOUNCEMENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AGENT_ANNOUNCEMENT';

CREATE TABLE IF NOT EXISTS "cache_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cache_key" VARCHAR(180) NOT NULL,
  "namespace" VARCHAR(80) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "ttl_seconds" INTEGER NOT NULL,
  "size_bytes" INTEGER NOT NULL DEFAULT 0,
  "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cache_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cache_entries_cache_key_key"
  ON "cache_entries"("cache_key");
CREATE INDEX IF NOT EXISTS "cache_entries_namespace_status_idx"
  ON "cache_entries"("namespace", "status");

CREATE TABLE IF NOT EXISTS "queue_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "queue_name" VARCHAR(80) NOT NULL,
  "job_name" VARCHAR(160) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL DEFAULT 5,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "error_message" TEXT,
  "scheduled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  "dead_lettered_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "queue_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "queue_jobs_queue_name_status_idx"
  ON "queue_jobs"("queue_name", "status");

CREATE TABLE IF NOT EXISTS "background_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "job_key" VARCHAR(120) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "queue_name" VARCHAR(80) NOT NULL,
  "schedule" VARCHAR(80) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "last_run_at" TIMESTAMP(3),
  "next_run_at" TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "background_jobs_job_key_key"
  ON "background_jobs"("job_key");
CREATE INDEX IF NOT EXISTS "background_jobs_queue_name_status_idx"
  ON "background_jobs"("queue_name", "status");

CREATE TABLE IF NOT EXISTS "search_insights" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_city" VARCHAR(120) NOT NULL,
  "destination_city" VARCHAR(120) NOT NULL,
  "search_count" INTEGER NOT NULL DEFAULT 0,
  "no_result_count" INTEGER NOT NULL DEFAULT 0,
  "abandoned_count" INTEGER NOT NULL DEFAULT 0,
  "average_booking_seconds" INTEGER NOT NULL DEFAULT 0,
  "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "search_insights_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "search_insights_source_city_destination_city_idx"
  ON "search_insights"("source_city", "destination_city");

CREATE TABLE IF NOT EXISTS "recommendation_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "recommendation_type" VARCHAR(80) NOT NULL,
  "source_city" VARCHAR(120) NOT NULL,
  "destination_city" VARCHAR(120) NOT NULL,
  "reason" TEXT NOT NULL,
  "confidence_score" DECIMAL(5,2) NOT NULL,
  "model_provider" VARCHAR(80) NOT NULL DEFAULT 'NONE',
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recommendation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "recommendation_events_recommendation_type_generated_at_idx"
  ON "recommendation_events"("recommendation_type", "generated_at");

CREATE TABLE IF NOT EXISTS "metric_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "metric_key" VARCHAR(120) NOT NULL,
  "value" DECIMAL(14,4) NOT NULL,
  "unit" VARCHAR(40) NOT NULL,
  "labels" JSONB NOT NULL DEFAULT '{}',
  "sampled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "metric_snapshots_metric_key_sampled_at_idx"
  ON "metric_snapshots"("metric_key", "sampled_at");

CREATE TABLE IF NOT EXISTS "seo_routes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "path" VARCHAR(180) NOT NULL,
  "title" VARCHAR(220) NOT NULL,
  "description" TEXT NOT NULL,
  "canonical_url" TEXT NOT NULL,
  "open_graph" JSONB NOT NULL DEFAULT '{}',
  "twitter_card" JSONB NOT NULL DEFAULT '{}',
  "json_ld" JSONB NOT NULL DEFAULT '{}',
  "breadcrumbs" JSONB NOT NULL DEFAULT '[]',
  "is_indexable" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_routes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "seo_routes_path_key" ON "seo_routes"("path");
CREATE INDEX IF NOT EXISTS "seo_routes_is_indexable_idx" ON "seo_routes"("is_indexable");
