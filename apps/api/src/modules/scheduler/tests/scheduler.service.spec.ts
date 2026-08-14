import { SchedulerRepository } from "../repositories/scheduler.repository";
import { SchedulerService } from "../services/scheduler.service";
import { SchedulerValidator } from "../validators/scheduler.validator";

describe("SchedulerService", () => {
  it("lists and runs background jobs", () => {
    const service = new SchedulerService(new SchedulerRepository(), new SchedulerValidator());
    const dashboard = service.getDashboard();
    const completed = service.run("JOB-ANALYTICS-SNAPSHOT");

    expect(dashboard.jobs.map((job) => job.name)).toContain("Expired Seat Cleanup");
    expect(dashboard.jobs.map((job) => job.name)).toContain("Monthly Reports");
    expect(completed.status).toBe("COMPLETED");
  });
});
