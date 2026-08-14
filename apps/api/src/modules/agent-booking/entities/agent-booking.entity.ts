import type { AgentBookingRecord } from "@vnbus/types";

export class AgentBookingEntity implements AgentBookingRecord {
  readonly booking!: AgentBookingRecord["booking"];
  readonly customer!: AgentBookingRecord["customer"];
  readonly ticket!: AgentBookingRecord["ticket"];
  readonly channel!: AgentBookingRecord["channel"];

  constructor(record: AgentBookingRecord) {
    Object.assign(this, record);
  }
}
