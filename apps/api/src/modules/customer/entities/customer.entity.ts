import type { AgentCustomerRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class CustomerContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): CustomerContextEntity {
    return new CustomerContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AgentCustomerEntity implements AgentCustomerRecord {
  readonly customerId!: AgentCustomerRecord["customerId"];
  readonly name!: AgentCustomerRecord["name"];
  readonly email!: AgentCustomerRecord["email"];
  readonly phone!: AgentCustomerRecord["phone"];
  readonly gender!: AgentCustomerRecord["gender"];
  readonly dateOfBirth!: AgentCustomerRecord["dateOfBirth"];
  readonly emergencyContact!: AgentCustomerRecord["emergencyContact"];
  readonly preferredRoutes!: AgentCustomerRecord["preferredRoutes"];
  readonly notes!: AgentCustomerRecord["notes"];
  readonly tags!: AgentCustomerRecord["tags"];
  readonly status!: AgentCustomerRecord["status"];
  readonly bookingCount!: AgentCustomerRecord["bookingCount"];
  readonly upcomingTrips!: AgentCustomerRecord["upcomingTrips"];
  readonly lifetimeValue!: AgentCustomerRecord["lifetimeValue"];
  readonly lastBookedAt!: AgentCustomerRecord["lastBookedAt"];
  readonly createdAt!: AgentCustomerRecord["createdAt"];
  readonly updatedAt!: AgentCustomerRecord["updatedAt"];

  constructor(customer: AgentCustomerRecord) {
    Object.assign(this, customer);
  }
}
