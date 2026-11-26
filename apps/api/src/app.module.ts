import { Module } from '@nestjs/common'

import { AppConfigModule } from './config/config.module'
import { DatabaseModule } from './db/db.module'
import { CacheModule } from './cache/cache.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { HealthModule } from './health/health.module'
import { OrdersModule } from './orders/orders.module'
import { PaymentsModule } from './payments/payments.module'
import { ProductsModule } from './products/products.module'

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CacheModule,
    AuthModule,
    UsersModule,
    HealthModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
})
export class AppModule {}
