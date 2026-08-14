import { Injectable } from "@nestjs/common";
import type {
  AdminPlatformSettingRecord,
  AdminPlatformSettingsResponse,
  UpdateAdminPlatformSettingRequest,
} from "@vnbus/types";

@Injectable()
export class PlatformSettingsRepository {
  private readonly settings = new Map<string, AdminPlatformSettingRecord>(
    seedSettings().map((setting) => [setting.settingId, setting]),
  );

  getSettings(): AdminPlatformSettingsResponse {
    const settings = this.listSettings();
    const value = (key: string) => settings.find((setting) => setting.key === key)?.value ?? "";

    return {
      settings,
      general: {
        brandName: value("brand.name"),
        logoUrl: value("brand.logo_url"),
        supportEmail: value("support.email"),
        supportPhone: value("support.phone"),
        timezone: value("general.timezone"),
        currency: "INR",
        taxPercentage: Number(value("finance.tax_percentage")),
        bookingFee: { amount: Number(value("finance.booking_fee")), currency: "INR" },
        cancellationPolicy: value("policy.cancellation"),
      },
    };
  }

  listSettings(): AdminPlatformSettingRecord[] {
    return [...this.settings.values()].sort((left, right) => left.key.localeCompare(right.key));
  }

  updateSetting(
    settingId: string,
    input: UpdateAdminPlatformSettingRequest,
  ): AdminPlatformSettingRecord | null {
    const existing = this.findSetting(settingId);
    if (!existing) {
      return null;
    }

    const updated: AdminPlatformSettingRecord = {
      ...existing,
      value: input.value,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(updated.settingId, updated);

    return updated;
  }

  findSetting(settingId: string): AdminPlatformSettingRecord | null {
    return (
      this.settings.get(settingId) ??
      this.listSettings().find((item) => item.key === settingId) ??
      null
    );
  }
}

function seedSettings(): AdminPlatformSettingRecord[] {
  return [
    setting("PSET-BRAND", "brand.name", "BRAND", "Brand Name", "Vriddhi Nexus Pvt Ltd"),
    setting("PSET-LOGO", "brand.logo_url", "BRAND", "Logo", "/brand/logo.svg"),
    setting("PSET-EMAIL", "support.email", "SUPPORT", "Support Email", "support@vriddhinexus.com"),
    setting("PSET-PHONE", "support.phone", "SUPPORT", "Support Phone", "+918045678899"),
    setting("PSET-TZ", "general.timezone", "GENERAL", "Timezone", "Asia/Kolkata"),
    setting("PSET-CURRENCY", "finance.currency", "FINANCE", "Currency", "INR"),
    setting("PSET-TAX", "finance.tax_percentage", "FINANCE", "Tax Percentage", "5"),
    setting("PSET-FEE", "finance.booking_fee", "FINANCE", "Booking Fee", "40"),
    setting(
      "PSET-CANCEL",
      "policy.cancellation",
      "POLICY",
      "Cancellation Policy",
      "Mock cancellation policy: refund eligibility depends on departure window.",
    ),
  ];
}

function setting(
  settingId: string,
  key: string,
  category: AdminPlatformSettingRecord["category"],
  label: string,
  value: string,
): AdminPlatformSettingRecord {
  return {
    settingId,
    key,
    category,
    label,
    value,
    description: `${label} for the enterprise admin platform configuration.`,
    isSecretReference: false,
    updatedAt: "2026-08-08T08:00:00.000Z",
  };
}
