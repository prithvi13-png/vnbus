import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  PaymentIntent,
  PaymentProviderConfig,
  PaymentResult,
  PaymentTransaction,
  PaymentWebhookResult,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import {
  CapturePaymentDto,
  CreatePaymentIntentDto,
  parsePaymentProviderCode,
} from "../dto/payment.dto";
import { PaymentService } from "../services/payment.service";

@ApiTags("Payments")
@ApiBearerAuth()
@Controller("payments")
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Roles("ADMIN")
  @Get("providers")
  listProviders(): PaymentProviderConfig[] {
    return this.service.listProviders();
  }

  @Roles("ADMIN")
  @Get("transactions")
  listTransactions(): PaymentTransaction[] {
    return this.service.listTransactions();
  }

  @Public()
  @Post("intents")
  @ApiOkResponse({ description: "Create a mock payment intent through the provider abstraction." })
  createIntent(@Body() dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    return this.service.createIntent(dto);
  }

  @Public()
  @Post("intents/:paymentIntentId/capture")
  capturePayment(
    @Param("paymentIntentId") paymentIntentId: string,
    @Body() dto: CapturePaymentDto,
  ): Promise<PaymentResult> {
    return this.service.capturePayment({
      ...dto,
      paymentIntentId,
    });
  }

  @Public()
  @Post("webhooks/:provider")
  @ApiOkResponse({ description: "Provider webhook endpoint with signature and idempotency hooks." })
  handleWebhook(
    @Param("provider") provider: string,
    @Body() payload: unknown,
    @Headers("x-payment-signature") signature?: string,
  ): Promise<PaymentWebhookResult> {
    return this.service.handleWebhook(parsePaymentProviderCode(provider), payload, signature);
  }
}
