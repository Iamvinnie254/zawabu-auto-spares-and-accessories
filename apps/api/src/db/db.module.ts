import {
  Global,
  Inject,
  Injectable,
  Module,
  type OnModuleDestroy,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'

import { schema } from './schema'

export const PG_CLIENT = 'PG_CLIENT'
export const DRIZZLE = 'DRIZZLE'

@Injectable()
class DatabaseLifecycle implements OnModuleDestroy {
  constructor(@Inject(PG_CLIENT) private readonly client: Sql) {}

  async onModuleDestroy(): Promise<void> {
    await this.client.end()
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        postgres(config.get<string>('DATABASE_URL')!, { max: 10 }),
    },
    {
      provide: DRIZZLE,
      inject: [PG_CLIENT],
      useFactory: (client: Sql) => drizzle(client, { schema }),
    },
    DatabaseLifecycle,
  ],
  exports: [PG_CLIENT, DRIZZLE],
})
export class DatabaseModule {}
