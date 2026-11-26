import { Module } from '@nestjs/common'

import { AppConfigModule } from './config/config.module'
import { DatabaseModule } from './db/db.module'
import { CacheModule } from './cache/cache.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CacheModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
