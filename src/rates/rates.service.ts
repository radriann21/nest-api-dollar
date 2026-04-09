import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class RatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // OBTENER ULTIMO PRECIO DEL DOLAR BCV
  async getLastBcvRate() {
    const cached = await this.cacheManager.get('last-bcv-rate');

    if (cached) {
      return cached;
    }

    try {
      const rate = await this.prisma.exchangeRate.findFirst({
        where: {
          source: {
            name: {
              equals: 'BCV',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const result = { price: Number(rate?.price) };
      await this.cacheManager.set('last-bcv-rate', result);
      return result;
    } catch (error) {
      this.logger.error(
        'Error al obtener el ultimo precio del dolar bcv',
        error,
      );
      throw error;
    }
  }

  // OBTENER ULTIMO PRECIO DEL DOLAR BINANCE
  async getLastBinanceRate() {
    const cached = await this.cacheManager.get('last-binance-rate');

    if (cached) {
      return cached;
    }

    try {
      const rate = await this.prisma.exchangeRate.findFirst({
        where: {
          source: {
            name: {
              equals: 'BINANCE',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const result = { price: Number(rate?.price) };
      await this.cacheManager.set('last-binance-rate', result);
      return result;
    } catch (error) {
      this.logger.error(
        'Error al obtener el ultimo precio del dolar binance',
        error,
      );
      throw error;
    }
  }

  // OBTENER LOS ULTIMOS PRECIOS DE AMBAS FUENTES
  async getLastRates() {
    const cached = await this.cacheManager.get('last-rates');

    if (cached) {
      return cached;
    }

    try {
      const [bcvRate, binanceRate] = await Promise.all([
        this.getLastBcvRate(),
        this.getLastBinanceRate(),
      ]);

      const result = {
        bcv: bcvRate,
        binance: binanceRate,
      };

      await this.cacheManager.set('last-rates', result);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener los ultimos precios', error);
      throw error;
    }
  }
}
