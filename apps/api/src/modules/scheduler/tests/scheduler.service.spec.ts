import { NotFoundException } from "@nestjs/common";

import { SchedulerRepository } from "../repositories/scheduler.repository";
import { SchedulerService } from "../services/scheduler.service";
import { SchedulerValidator } from "../validators/scheduler.validator";

describe("SchedulerService", () => {
  it("lists no jobs, since nothing schedules work on a timer yet", () => {
    const service = new SchedulerService(new SchedulerRepository(), new SchedulerValidator());
    const dashboard = service.getDashboard();

    expect(dashboard.jobs).toEqual([]);
    expect(dashboard.schedulerQueue).toMatchObject({ waiting: 0, delayed: 0, retryScheduled: 0 });
  });

  it("refuses to run a job that does not exist", () => {
    const service = new SchedulerService(new SchedulerRepository(), new SchedulerValidator());

    expect(() => service.run("JOB-ANALYTICS-SNAPSHOT")).toThrow(NotFoundException);
  });
});
