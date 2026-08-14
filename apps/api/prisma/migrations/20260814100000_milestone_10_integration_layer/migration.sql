CREATE TABLE "supplier_request_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "request_id" VARCHAR(120) NOT NULL,
  "supplier_code" VARCHAR(40) NOT NULL,
  "operation" VARCHAR(80) NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "duration_ms" INTEGER NOT NULL DEFAULT 0,
  "http_status" INTEGER,
  "success" BOOLEAN NOT NULL,
  "error_code" VARCHAR(80),
  "correlation_id" VARCHAR(120) NOT NULL,
  "trace_id" VARCHAR(120) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "supplier_request_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "supplier_request_logs_request_id_key" ON "supplier_request_logs"("request_id");
CREATE INDEX "supplier_request_logs_supplier_code_operation_timestamp_idx" ON "supplier_request_logs"("supplier_code", "operation", "timestamp");
CREATE INDEX "supplier_request_logs_correlation_id_idx" ON "supplier_request_logs"("correlation_id");

CREATE TABLE "supplier_health_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "supplier_code" VARCHAR(40) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "response_time_ms" INTEGER NOT NULL DEFAULT 0,
  "success_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
  "failure_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
  "last_successful_request_at" TIMESTAMP(3),
  "last_failure_at" TIMESTAMP(3),
  "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "supplier_health_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "supplier_health_snapshots_supplier_code_checked_at_idx" ON "supplier_health_snapshots"("supplier_code", "checked_at");
CREATE INDEX "supplier_health_snapshots_status_idx" ON "supplier_health_snapshots"("status");

CREATE TABLE "supplier_circuit_states" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "supplier_code" VARCHAR(40) NOT NULL,
  "state" VARCHAR(40) NOT NULL,
  "failure_count" INTEGER NOT NULL DEFAULT 0,
  "opened_at" TIMESTAMP(3),
  "next_retry_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "supplier_circuit_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "supplier_circuit_states_supplier_code_key" ON "supplier_circuit_states"("supplier_code");
CREATE INDEX "supplier_circuit_states_state_next_retry_at_idx" ON "supplier_circuit_states"("state", "next_retry_at");

CREATE TABLE "payment_provider_configurations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(40) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "environment" VARCHAR(80) NOT NULL DEFAULT 'SANDBOX_PLACEHOLDER',
  "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
  "credential_secret_ref" TEXT,
  "configuration" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_provider_configurations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_provider_configurations_code_key" ON "payment_provider_configurations"("code");
CREATE INDEX "payment_provider_configurations_enabled_environment_idx" ON "payment_provider_configurations"("enabled", "environment");

CREATE TABLE "payment_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "transaction_id" VARCHAR(120) NOT NULL,
  "payment_intent_id" VARCHAR(120) NOT NULL,
  "provider_code" VARCHAR(40) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
  "provider_reference" VARCHAR(160),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_transactions_transaction_id_key" ON "payment_transactions"("transaction_id");
CREATE INDEX "payment_transactions_payment_intent_id_idx" ON "payment_transactions"("payment_intent_id");
CREATE INDEX "payment_transactions_provider_code_status_idx" ON "payment_transactions"("provider_code", "status");

CREATE TABLE "payment_webhook_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "provider_code" VARCHAR(40) NOT NULL,
  "event_id" VARCHAR(160) NOT NULL,
  "event_type" VARCHAR(120) NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "status" VARCHAR(40) NOT NULL,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  "error_message" TEXT,
  CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_webhook_events_provider_code_event_id_key" ON "payment_webhook_events"("provider_code", "event_id");
CREATE INDEX "payment_webhook_events_status_received_at_idx" ON "payment_webhook_events"("status", "received_at");

CREATE TABLE "idempotency_keys" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "scope" VARCHAR(80) NOT NULL,
  "key" VARCHAR(180) NOT NULL,
  "fingerprint" VARCHAR(128) NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "response" JSONB,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idempotency_keys_scope_key_key" ON "idempotency_keys"("scope", "key");
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

CREATE TABLE "distributed_locks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "lock_key" VARCHAR(180) NOT NULL,
  "owner" VARCHAR(180) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "distributed_locks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "distributed_locks_lock_key_key" ON "distributed_locks"("lock_key");
CREATE INDEX "distributed_locks_expires_at_idx" ON "distributed_locks"("expires_at");
