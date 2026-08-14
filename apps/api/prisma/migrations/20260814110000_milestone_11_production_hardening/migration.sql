-- Milestone 11 production-readiness indexes.
-- These are additive and safe to apply repeatedly in managed PostgreSQL environments.

CREATE INDEX IF NOT EXISTS "bookings_customer_id_status_idx" ON "bookings"("customer_id", "status");
CREATE INDEX IF NOT EXISTS "bookings_agent_id_status_idx" ON "bookings"("agent_id", "status");
CREATE INDEX IF NOT EXISTS "bookings_status_journey_date_idx" ON "bookings"("status", "journey_date");
CREATE INDEX IF NOT EXISTS "bookings_source_city_destination_city_journey_date_idx" ON "bookings"("source_city", "destination_city", "journey_date");
CREATE INDEX IF NOT EXISTS "bookings_pnr_idx" ON "bookings"("pnr");
CREATE INDEX IF NOT EXISTS "bookings_supplier_code_supplier_booking_id_idx" ON "bookings"("supplier_code", "supplier_booking_id");

CREATE INDEX IF NOT EXISTS "passengers_email_idx" ON "passengers"("email");
CREATE INDEX IF NOT EXISTS "passengers_phone_idx" ON "passengers"("phone");

CREATE INDEX IF NOT EXISTS "tickets_pnr_idx" ON "tickets"("pnr");
CREATE INDEX IF NOT EXISTS "tickets_journey_date_status_idx" ON "tickets"("journey_date", "status");

CREATE INDEX IF NOT EXISTS "notifications_status_created_at_idx" ON "notifications"("status", "created_at");
CREATE INDEX IF NOT EXISTS "notifications_queued_at_idx" ON "notifications"("queued_at");

CREATE INDEX IF NOT EXISTS "email_logs_status_next_retry_at_idx" ON "email_logs"("status", "next_retry_at");

CREATE INDEX IF NOT EXISTS "supplier_request_logs_success_timestamp_idx" ON "supplier_request_logs"("success", "timestamp");
CREATE INDEX IF NOT EXISTS "supplier_request_logs_error_code_timestamp_idx" ON "supplier_request_logs"("error_code", "timestamp");

CREATE INDEX IF NOT EXISTS "payment_transactions_status_created_at_idx" ON "payment_transactions"("status", "created_at");
CREATE INDEX IF NOT EXISTS "payment_transactions_provider_reference_idx" ON "payment_transactions"("provider_reference");

CREATE INDEX IF NOT EXISTS "payment_webhook_events_provider_code_status_received_at_idx" ON "payment_webhook_events"("provider_code", "status", "received_at");

CREATE INDEX IF NOT EXISTS "reservations_supplier_code_journey_date_status_idx" ON "reservations"("supplier_code", "journey_date", "status");
CREATE INDEX IF NOT EXISTS "reservations_booking_id_idx" ON "reservations"("booking_id");

CREATE INDEX IF NOT EXISTS "search_insights_snapshot_at_idx" ON "search_insights"("snapshot_at");
