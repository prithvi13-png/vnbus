import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { platformQueues } from "./dto/enqueue-job.dto";
import { QueueSystemController } from "./controllers/queue-system.controller";
import { QueueSystemRepository } from "./repositories/queue-system.repository";
import { QueueSystemService } from "./services/queue-system.service";
import { QueueSystemValidator } from "./validators/queue-system.validator";

@Module({
  imports: [
    BullModule.registerQueue(
      ...platformQueues.map((queue) => ({
        name: queue,
      })),
    ),
  ],
  controllers: [QueueSystemController],
  providers: [QueueSystemService, QueueSystemRepository, QueueSystemValidator],
  exports: [QueueSystemService],
})
export class QueueSystemModule {}
