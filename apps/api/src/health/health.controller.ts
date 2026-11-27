import { Controller, Get } from "@nestjs/common";
import { sql } from "drizzle-orm";

import { Public } from "../common/auth.decorators";
import { CacheService } from "../cache/cache.service";
import { DRIZZLE } from "../db/db.module";
import type { Database } from "../db/schema";
import { Inject } from "@nestjs/common";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly cache: CacheService,
  ) {}

  @Public()
  @Get()
  async check() {
    await this.db.execute(sql`select 1`);
    const redis = await this.cache.ping();
    return {
      status: redis ? "ok" : "degraded",
      database: "ok",
      redis: redis ? "ok" : "unavailable",
      timestamp: new Date().toISOString(),
    };
  }
}
