import type { HealthCheckComponent, HealthCheckResponse } from "@vnbus/types";

export class HealthComponentEntity implements HealthCheckComponent {
  constructor(private readonly record: HealthCheckComponent) {}

  get component(): HealthCheckComponent["component"] {
    return this.record.component;
  }

  get status(): HealthCheckComponent["status"] {
    return this.record.status;
  }

  get latencyMs(): number {
    return this.record.latencyMs;
  }

  get message(): string {
    return this.record.message;
  }
}

export class HealthCheckEntity implements HealthCheckResponse {
  constructor(private readonly record: HealthCheckResponse) {}

  get status(): HealthCheckResponse["status"] {
    return this.record.status;
  }

  get checkedAt(): string {
    return this.record.checkedAt;
  }

  get components(): HealthCheckResponse["components"] {
    return this.record.components;
  }
}
