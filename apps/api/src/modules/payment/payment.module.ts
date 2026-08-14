import { Module } from "@nestjs/common";

import { IntegrationModule } from "../integration/integration.module";
import { PaymentController } from "./controllers/payment.controller";
import { PaymentRepository } from "./repositories/payment.repository";
import { PaymentService } from "./services/payment.service";

@Module({
  imports: [IntegrationModule],
  controllers: [PaymentController],
  providers: [PaymentRepository, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
