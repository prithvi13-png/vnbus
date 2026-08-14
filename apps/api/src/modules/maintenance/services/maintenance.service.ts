import { Injectable, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { MaintenanceModeStatus, UpdateMaintenanceModeRequest } from "@vnbus/types";

const defaultMessage = "Vriddhi Nexus Bus is temporarily unavailable for scheduled maintenance.";

@Injectable()
export class MaintenanceService {
  private state: MaintenanceModeStatus;

  constructor(@Optional() private readonly config?: ConfigService) {
    this.state = {
      enabled: this.config?.get<boolean>("MAINTENANCE_MODE") ?? false,
      message: defaultMessage,
      updatedAt: null,
    };
  }

  getStatus(): MaintenanceModeStatus {
    return this.state;
  }

  update(input: UpdateMaintenanceModeRequest): MaintenanceModeStatus {
    this.state = {
      enabled: input.enabled ?? this.state.enabled,
      message: input.message?.trim() || this.state.message,
      updatedAt: new Date().toISOString(),
    };

    return this.state;
  }
}
