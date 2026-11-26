import { Controller, Inject, Post } from '@nestjs/common'
import {
  paymentCallbackSchema,
  stkPaymentSchema,
  type PaymentCallbackInput,
  type StkPaymentInput,
} from '@zawabu/shared'

import { Public } from '../common/auth.decorators'
import { ZodBody } from '../common/zod-params'
import { OrdersService } from '../orders/orders.service'
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './payment-provider'

@Controller('payments/mpesa')
export class PaymentsController {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly ordersService: OrdersService,
  ) {}

  @Public()
  @Post('stk')
  async stk(@ZodBody(stkPaymentSchema) body: StkPaymentInput) {
    const result = await this.provider.initiate(body.orderId, body.phone)
    await this.ordersService.attachPaymentReference(body.orderId, result.reference)
    return result
  }

  @Public()
  @Post('callback')
  async callback(@ZodBody(paymentCallbackSchema) body: PaymentCallbackInput) {
    const order = await this.ordersService.markPayment(
      body.reference,
      body.status,
    )

    return {
      received: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
    }
  }
}
