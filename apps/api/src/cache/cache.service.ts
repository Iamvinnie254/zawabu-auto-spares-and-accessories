import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClient } from 'bun'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name)
  private client?: RedisClient

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.client = new RedisClient(
      this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
    )
  }

  onModuleDestroy(): void {
    this.client?.close()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client?.get(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (error) {
      this.logger.warn(`Cache read failed for ${key}: ${String(error)}`)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.client?.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch (error) {
      this.logger.warn(`Cache write failed for ${key}: ${String(error)}`)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client?.del(key)
    } catch (error) {
      this.logger.warn(`Cache delete failed for ${key}: ${String(error)}`)
    }
  }

  async invalidate(prefix: string): Promise<void> {
    try {
      const keys = await this.client?.keys(`${prefix}:*`)
      if (keys?.length) {
        await this.client?.del(...keys)
      }
    } catch (error) {
      this.logger.warn(`Cache invalidation failed for ${prefix}: ${String(error)}`)
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client?.send('PING', [])
      return String(result).toUpperCase() === 'PONG'
    } catch (error) {
      this.logger.warn(`Cache ping failed: ${String(error)}`)
      return false
    }
  }
}
