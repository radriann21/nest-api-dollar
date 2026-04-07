import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class RatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  // OBTENER ULTIMO PRECIO DEL DOLAR BCV
  async getLastBcvRate() {
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
      return rate;
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
      return rate;
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
    try {
      const [bcvRate, binanceRate] = await Promise.all([
        this.getLastBcvRate(),
        this.getLastBinanceRate(),
      ]);
      return {
        bcv: bcvRate,
        binance: binanceRate,
      };
    } catch (error) {
      this.logger.error('Error al obtener los ultimos precios', error);
      throw error;
    }
  }
}
