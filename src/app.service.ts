import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async healthCheck() {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        cache: 'unknown',
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      status.services.database = 'healthy';
    } catch {
      status.services.database = 'unhealthy';
      status.status = 'degraded';
    }

    try {
      const testKey = 'healthcheck';
      await this.cacheManager.set(testKey, 'ok', 5000);
      const result = await this.cacheManager.get(testKey);
      status.services.cache = result === 'ok' ? 'healthy' : 'unhealthy';
      await this.cacheManager.del(testKey);
    } catch {
      status.services.cache = 'unhealthy';
      status.status = 'degraded';
    }

    if (
      status.services.database === 'unhealthy' &&
      status.services.cache === 'unhealthy'
    ) {
      status.status = 'error';
    }

    return status;
  }
}
