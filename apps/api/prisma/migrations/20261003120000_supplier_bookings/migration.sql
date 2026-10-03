-- Real supplier bookings. Additive only: existing rows keep their values and
-- pick up the defaults.
--
-- trip_id            the supplier's trip handle (SRDV packs its TraceId,
--                    SrdvIndex and ResultIndex into it; cancellation needs it)
-- supplier_block_id  the supplier's seat block (SRDV's BlockKey)
-- ticket_number      the ticket number the supplier issued
-- channel            CUSTOMER or AGENT, whoever made the booking
-- details            the trip, boarding/dropping points and fare exactly as
--                    they were when booked, so the ticket never changes later
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "trip_id" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "supplier_block_id" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "ticket_number" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "confirmed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "channel" VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
  ADD COLUMN IF NOT EXISTS "details" JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "bookings_user_id_created_at_idx" ON "bookings"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "bookings_ticket_number_idx" ON "bookings"("ticket_number");
