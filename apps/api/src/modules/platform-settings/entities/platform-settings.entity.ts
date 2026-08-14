import type { AdminPlatformSettingRecord, AdminPlatformSettingsResponse } from "@vnbus/types";

export class PlatformSettingEntity {
  constructor(readonly setting: AdminPlatformSettingRecord) {}
}

export class PlatformSettingsEntity {
  constructor(readonly settings: AdminPlatformSettingsResponse) {}
}
