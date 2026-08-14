-- Milestone 7: B2B travel agent portal persistence model.

ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "email" VARCHAR(320),
  ADD COLUMN IF NOT EXISTS "gender" "Gender",
  ADD COLUMN IF NOT EXISTS "emergency_contact" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "preferred_routes" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(40) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers"("email");
CREATE INDEX IF NOT EXISTS "customers_status_idx" ON "customers"("status");

ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "agency_address" TEXT,
  ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
  ADD COLUMN IF NOT EXISTS "email_preferences" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "notification_preferences" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "customer_notes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "created_by" VARCHAR(160),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_notes_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "customer_notes_customer_id_created_at_idx"
  ON "customer_notes"("customer_id", "created_at");

CREATE TABLE IF NOT EXISTS "customer_tags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL,
  "label" VARCHAR(80) NOT NULL,
  "color" VARCHAR(40) NOT NULL DEFAULT 'gray',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_tags_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_tags_customer_id_label_key"
  ON "customer_tags"("customer_id", "label");
CREATE INDEX IF NOT EXISTS "customer_tags_label_idx" ON "customer_tags"("label");

CREATE TABLE IF NOT EXISTS "agent_reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "agent_id" UUID NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "type" VARCHAR(80) NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'READY',
  "filters" JSONB,
  "data" JSONB NOT NULL DEFAULT '{}',
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_reports_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "agent_reports_agent_id_fkey"
    FOREIGN KEY ("agent_id") REFERENCES "agents"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "agent_reports_agent_id_type_status_idx"
  ON "agent_reports"("agent_id", "type", "status");

CREATE TABLE IF NOT EXISTS "agent_activity_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "agent_id" UUID NOT NULL,
  "action" VARCHAR(120) NOT NULL,
  "message" TEXT NOT NULL,
  "entity_type" VARCHAR(120),
  "entity_id" VARCHAR(120),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_activity_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "agent_activity_logs_agent_id_fkey"
    FOREIGN KEY ("agent_id") REFERENCES "agents"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "agent_activity_logs_agent_id_created_at_idx"
  ON "agent_activity_logs"("agent_id", "created_at");
CREATE INDEX IF NOT EXISTS "agent_activity_logs_entity_type_entity_id_idx"
  ON "agent_activity_logs"("entity_type", "entity_id");
