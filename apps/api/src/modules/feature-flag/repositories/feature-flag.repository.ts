import { Injectable } from "@nestjs/common";
import type { AdminFeatureFlagRecord, UpdateAdminFeatureFlagRequest } from "@vnbus/types";

@Injectable()
export class FeatureFlagRepository {
  private readonly flags = new Map<string, AdminFeatureFlagRecord>(
    seedFlags().map((flag) => [flag.flagId, flag]),
  );

  list(): AdminFeatureFlagRecord[] {
    return [...this.flags.values()].sort((left, right) => left.key.localeCompare(right.key));
  }

  update(flagId: string, input: UpdateAdminFeatureFlagRequest): AdminFeatureFlagRecord | null {
    const existing = this.find(flagId);
    if (!existing) {
      return null;
    }

    const updated: AdminFeatureFlagRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.flags.set(updated.flagId, updated);

    return updated;
  }

  find(flagId: string): AdminFeatureFlagRecord | null {
    return this.flags.get(flagId) ?? this.list().find((flag) => flag.key === flagId) ?? null;
  }
}

function seedFlags(): AdminFeatureFlagRecord[] {
  return [
    flag("FF-AI", "enable-ai", "Enable AI", true, 100, "Product"),
    flag("FF-TRACKING", "enable-tracking", "Enable Tracking", true, 100, "Operations"),
    flag("FF-COUPONS", "enable-coupons", "Enable Coupons", true, 100, "Growth"),
    flag("FF-OFFERS", "enable-offers", "Enable Offers", true, 100, "Growth"),
    flag("FF-AGENT", "enable-agent-portal", "Enable Agent Portal", true, 100, "B2B"),
    flag("FF-EMAIL", "enable-email", "Enable Email", true, 100, "Platform"),
    flag(
      "FF-SUPPLIERS",
      "enable-supplier-integrations",
      "Enable Supplier Integrations",
      false,
      0,
      "SRE",
    ),
    flag("FF-PAYMENTS", "enable-payments", "Enable Payments", true, 100, "Finance"),
    flag("FF-MAINT", "enable-maintenance-mode", "Enable Maintenance Mode", false, 0, "SRE"),
  ];
}

function flag(
  flagId: string,
  key: string,
  name: string,
  enabled: boolean,
  rolloutPercentage: number,
  owner: string,
): AdminFeatureFlagRecord {
  return {
    flagId,
    key,
    name,
    description: `${name} controls the mock admin feature rollout.`,
    enabled,
    rolloutPercentage,
    owner,
    updatedAt: "2026-08-08T08:00:00.000Z",
  };
}
