import { BadRequestException, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GapTrendDto } from './dto/gapTrend.dto';
import { GapTrend, Periods } from './interfaces/interfaces';
import { VolatilityDto } from './dto/volatility.dto';

@Injectable()
export class AnaliticsService {
  private readonly logger = new Logger(AnaliticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // BRECHA ACTUAL
  async getActualGap() {
    const lastBCVPrice = await this.prisma.exchangeRate.findFirst({
      where: {
        source: {
          name: 'BCV',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const lastBinancePrice = await this.prisma.exchangeRate.findFirst({
      where: {
        source: {
          name: 'Binance',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastBCVPrice || !lastBinancePrice) {
      this.logger.log(lastBCVPrice);
      this.logger.log(lastBinancePrice);
      return {
        message: 'No se encontraron precios',
      };
    }

    const actualGap = this.calculateGap(
      Number(lastBCVPrice.price),
      Number(lastBinancePrice.price),
    );

    return {
      gap: {
        value: Number(actualGap.toFixed(2)),
        formatted: `${actualGap.toFixed(2)}%`,
        description:
          actualGap > 5
            ? 'Alta brecha'
            : actualGap > 2
              ? 'Brecha moderada'
              : 'Brecha baja',
      },
      bcv: {
        price: Number(lastBCVPrice.price),
        updatedAt: lastBCVPrice.createdAt,
      },
      binance: {
        price: Number(lastBinancePrice.price),
        updatedAt: lastBinancePrice.createdAt,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // CALCULO DE TENDENCIA DE BRECHA CAMBIARIA SEGUN UN MARCO DE TIEMPO
  async gapTrend({ period }: GapTrendDto) {
    const date = this.getDateFor(period);
    const actualGapResult = await this.getActualGap();

    if ('message' in actualGapResult) {
      return {
        currentGap: { value: 0, formatted: '0%' },
        historicalGap: { value: 0, formatted: '0%', period },
        trend: {
          direction: GapTrend.STABLE,
          label: 'Estable',
          change: { value: 0, formatted: '0%' },
        },
        analysis: 'No hay datos disponibles para calcular la brecha actual',
        timestamp: new Date().toISOString(),
      };
    }

    const actualGap = actualGapResult.gap.value;

    const BCVPrices = await this.prisma.exchangeRate.findFirst({
      where: {
        source: {
          name: 'BCV',
        },
        createdAt: {
          gte: date,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const BinancePrices = await this.prisma.exchangeRate.findFirst({
      where: {
        source: {
          name: 'Binance',
        },
        createdAt: {
          gte: date,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!BCVPrices || !BinancePrices) {
      return {
        actualGap,
        oldGap: 0,
      };
    }

    const oldGap = this.calculateGap(
      Number(BCVPrices.price),
      Number(BinancePrices.price),
    );

    let trend: GapTrend;
    if (Number(actualGap) > Number(oldGap)) {
      trend = GapTrend.INCREASING;
    } else if (Number(actualGap) < Number(oldGap)) {
      trend = GapTrend.DECREASING;
    } else {
      trend = GapTrend.STABLE;
    }

    const change = Number(actualGap) - Number(oldGap);

    return {
      currentGap: {
        value: Number(actualGap.toFixed(2)),
        formatted: `${actualGap.toFixed(2)}%`,
      },
      historicalGap: {
        value: Number(oldGap.toFixed(2)),
        formatted: `${oldGap.toFixed(2)}%`,
        period,
      },
      trend: {
        direction: trend,
        label:
          trend === GapTrend.INCREASING
            ? 'Aumentando'
            : trend === GapTrend.DECREASING
              ? 'Disminuyendo'
              : 'Estable',
        change: {
          value: Number(change.toFixed(2)),
          formatted: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
        },
      },
      analysis:
        trend === GapTrend.INCREASING
          ? 'La brecha entre el paralelo y el oficial está creciendo'
          : trend === GapTrend.DECREASING
            ? 'La brecha entre el paralelo y el oficial está reduciéndose'
            : 'La brecha se mantiene estable respecto al período anterior',
      timestamp: new Date().toISOString(),
    };
  }

  // CALCULO DE VOLATILIDAD
  async volatility({ period, source }: VolatilityDto) {
    if (!period || !source) {
      throw new BadRequestException('Period and source are required');
    }

    const date = this.getDateFor(period);
    const data = await this.getDataByPeriodAndSource(period, source);

    // Rango Porcentual (Usado para completar informacion)
    const minPrice = Math.min(...data.map((item) => Number(item.price)));
    const maxPrice = Math.max(...data.map((item) => Number(item.price)));
    const range = maxPrice - minPrice;
    const rangePercentage = (range / minPrice) * 100;

    // Desviacion Estandar
    const mean =
      data.reduce((acc, item) => acc + Number(item.price), 0) / data.length;
    const variance =
      data.reduce(
        (acc, item) => acc + Math.pow(Number(item.price) - mean, 2),
        0,
      ) / data.length;
    const standardDeviation = Math.sqrt(variance);
    const standardDeviationPercentage = (standardDeviation / mean) * 100;

    const dataPoints = data.length;

    if (dataPoints === 0) {
      throw new BadRequestException(
        `No hay datos disponibles para ${source} en el período ${period}`,
      );
    }

    const volatilityLevel =
      standardDeviationPercentage < 1
        ? 'VERY_LOW'
        : standardDeviationPercentage < 3
          ? 'LOW'
          : standardDeviationPercentage < 7
            ? 'MODERATE'
            : standardDeviationPercentage < 15
              ? 'HIGH'
              : 'VERY_HIGH';

    const volatilityLabel = {
      VERY_LOW: 'Muy estable',
      LOW: 'Estable',
      MODERATE: 'Moderada',
      HIGH: 'Alta',
      VERY_HIGH: 'Muy alta',
    }[volatilityLevel];

    return {
      source,
      period,
      summary: {
        dataPoints,
        dateRange: {
          from: date.toISOString(),
          to: new Date().toISOString(),
        },
      },
      metrics: {
        volatility: {
          level: volatilityLevel,
          label: volatilityLabel,
          standardDeviation: {
            value: Number(standardDeviationPercentage.toFixed(2)),
            formatted: `${standardDeviationPercentage.toFixed(2)}%`,
          },
          range: {
            value: Number(rangePercentage.toFixed(2)),
            formatted: `${rangePercentage.toFixed(2)}%`,
            minPrice: Number(minPrice.toFixed(2)),
            maxPrice: Number(maxPrice.toFixed(2)),
          },
        },
        interpretation:
          volatilityLevel === 'VERY_LOW' || volatilityLevel === 'LOW'
            ? `El ${source} mostró poca variabilidad en este período`
            : volatilityLevel === 'MODERATE'
              ? `El ${source} tuvo movimientos moderados`
              : `El ${source} experimentó alta volatilidad`,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // DOLAR REFERENCIAL
  async referenceDollar() {
    const lastBCVPrice = await this.prisma.exchangeRate.findFirst({
      where: {
        source: {
          name: 'BCV',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const lastBinancePrice = await this.prisma.exchangeRate.findFirst({
      where: {
        source: {
          name: 'Binance',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastBCVPrice || !lastBinancePrice) {
      throw new Error(
        'No se encontraron precios para calcular el dolar referencial',
      );
    }

    const getReferentialRate = this.getReferentialRate(
      Number(lastBCVPrice.price),
      Number(lastBinancePrice.price),
      { bcv: 0.6, binance: 0.4 },
    );

    return {
      rates: {
        bcv: {
          price: Number(lastBCVPrice.price),
          weight: '60%',
          updatedAt: lastBCVPrice.createdAt,
        },
        binance: {
          price: Number(lastBinancePrice.price),
          weight: '40%',
          updatedAt: lastBinancePrice.createdAt,
        },
      },
      referential: {
        price: Number(getReferentialRate.toFixed(2)),
        calculation: `(${Number(lastBCVPrice.price)} × 0.6 + ${Number(lastBinancePrice.price)} × 0.4) / 2`,
        description:
          'Promedio ponderado: 60% BCV (oficial) + 40% Binance (paralelo)',
      },
      comparison: {
        brecha: {
          value: Number(
            (
              ((Number(lastBinancePrice.price) - Number(lastBCVPrice.price)) /
                Number(lastBCVPrice.price)) *
              100
            ).toFixed(2),
          ),
          formatted: `${(
            ((Number(lastBinancePrice.price) - Number(lastBCVPrice.price)) /
              Number(lastBCVPrice.price)) *
            100
          ).toFixed(2)}%`,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /* Metodos reutilizables  */
  private getDateFor(period: Periods) {
    const now = new Date();
    switch (period) {
      case Periods.YESTERDAY:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case Periods.WEEK:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case Periods.MONTH:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  private calculateGap(bcvPrice: number, binancePrice: number) {
    return ((binancePrice - bcvPrice) / bcvPrice) * 100;
  }

  private async getDataByPeriodAndSource(period: Periods, source: string) {
    const date = this.getDateFor(period);
    return this.prisma.exchangeRate.findMany({
      where: {
        source: {
          name: source,
        },
        createdAt: {
          gte: date,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  private getReferentialRate(
    bcvPrice: number,
    binancePrice: number,
    weigths: { bcv: number; binance: number },
  ) {
    return (bcvPrice * weigths.bcv + binancePrice * weigths.binance) / 2;
  }
}
