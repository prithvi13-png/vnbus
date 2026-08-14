import { ServiceUnavailableException } from "@nestjs/common";

import { MaintenanceGuard } from "../guards/maintenance.guard";
import { MaintenanceService } from "../services/maintenance.service";

describe("MaintenanceService", () => {
  it("updates maintenance mode status", () => {
    const service = new MaintenanceService();

    expect(service.getStatus().enabled).toBe(false);
    expect(service.update({ enabled: true, message: "Scheduled release" })).toEqual(
      expect.objectContaining({
        enabled: true,
        message: "Scheduled release",
      }),
    );
  });

  it("blocks customer routes while allowing health probes", () => {
    const service = new MaintenanceService();
    const guard = new MaintenanceGuard(service);

    service.update({ enabled: true });

    expect(() => guard.canActivate(contextFor("/api/v1/search"))).toThrow(
      ServiceUnavailableException,
    );
    expect(guard.canActivate(contextFor("/api/v1/health/ready"))).toBe(true);
  });
});

function contextFor(originalUrl: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl, url: originalUrl }),
    }),
  } as never;
}
