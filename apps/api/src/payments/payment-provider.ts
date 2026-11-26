import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER'

export interface InitiatePaymentResult {
  provider: 'stub'
  reference: string
  status: 'Pending'
  message: string
}

export interface PaymentProvider {
  initiate(orderId: string, phone: string): Promise<InitiatePaymentResult>
}

@Injectable()
export class StubPaymentProvider implements PaymentProvider {
  async initiate(_orderId: string, _phone: string): Promise<InitiatePaymentResult> {
    const reference = `MPESA-${randomUUID().slice(0, 8).toUpperCase()}`

    return {
      provider: 'stub',
      reference,
      status: 'Pending',
      message: 'STK push simulated. Replace with Safaricom Daraja in production.',
    }
  }
}
