import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AgentCustomerRecord, CreateAgentCustomerRequest } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class CustomerModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Customer module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Customer module must expose at least one capability");
    }
  }

  ensureUnique(request: CreateAgentCustomerRequest, existing: AgentCustomerRecord[]): void {
    const duplicate = existing.find(
      (customer) =>
        customer.email.toLowerCase() === request.email.toLowerCase() ||
        customer.phone === request.phone,
    );

    if (duplicate) {
      throw new BadRequestException("Duplicate customer");
    }
  }

  ensureFound(customer: AgentCustomerRecord | null): asserts customer is AgentCustomerRecord {
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  ensureBookable(customer: AgentCustomerRecord | null): asserts customer is AgentCustomerRecord {
    this.ensureFound(customer);
    if (customer.status === "BLOCKED") {
      throw new BadRequestException("Customer is blocked");
    }
  }
}
