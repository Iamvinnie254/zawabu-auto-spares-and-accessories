import { Module } from "@nestjs/common";

import { OrdersModule } from "../orders/orders.module";
import { PAYMENT_PROVIDER, StubPaymentProvider } from "./payment-provider";
import { PaymentsController } from "./payments.controller";

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [StubPaymentProvider, { provide: PAYMENT_PROVIDER, useExisting: StubPaymentProvider }],
})
export class PaymentsModule {}
