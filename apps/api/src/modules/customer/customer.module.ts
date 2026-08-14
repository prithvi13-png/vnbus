import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { CustomerController } from "./controllers/customer.controller";
import { CustomerMapper } from "./mappers/customer.mapper";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerService } from "./services/customer.service";
import { CustomerModuleValidator } from "./validators/customer.validator";

@Module({
  imports: [BookingModule],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, CustomerModuleValidator, CustomerMapper],
  exports: [CustomerService],
})
export class CustomerModule {}
