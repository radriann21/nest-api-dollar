import { Controller } from '@nestjs/common';
import { AnaliticsService } from './analitics.service';
import { Get, Query } from '@nestjs/common';
import { GapTrendDto } from './dto/gapTrend.dto';
import { VolatilityDto } from './dto/volatility.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analitics')
export class AnaliticsController {
  constructor(private readonly analiticsService: AnaliticsService) {}

  @Get('gap')
  @ApiOperation({
    summary: 'Brecha cambiaria actual',
    description:
      'Calcula la brecha entre el dólar BCV (oficial) y el dólar Binance (paralelo) en porcentaje.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna la brecha actual formateada con precios de ambas fuentes',
    schema: {
      example: {
        gap: {
          value: 7.42,
          formatted: '7.42%',
          description: 'Alta brecha',
        },
        bcv: {
          price: 48.5,
          updatedAt: '2025-01-15T10:00:00.000Z',
        },
        binance: {
          price: 52.1,
          updatedAt: '2025-01-15T10:00:00.000Z',
        },
        timestamp: '2025-01-15T10:05:00.000Z',
      },
    },
  })
  getActualGap() {
    return this.analiticsService.getActualGap();
  }

  @Get('gap-trend')
  @ApiOperation({
    summary: 'Tendencia de la brecha cambiaria',
    description:
      'Compara la brecha actual con la brecha de un período histórico (ayer, semana o mes) para determinar si está aumentando, disminuyendo o estable.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna la tendencia con análisis textual y cambios formateados',
    schema: {
      example: {
        currentGap: {
          value: 7.42,
          formatted: '7.42%',
        },
        historicalGap: {
          value: 6.85,
          formatted: '6.85%',
          period: 'week',
        },
        trend: {
          direction: 'INCREASING',
          label: '↗️ Aumentando',
          change: {
            value: 0.57,
            formatted: '+0.57%',
          },
        },
        analysis: 'La brecha entre el paralelo y el oficial está creciendo',
        timestamp: '2025-01-15T10:05:00.000Z',
      },
    },
  })
  getGapTrend(@Query() dto: GapTrendDto) {
    return this.analiticsService.gapTrend(dto);
  }

  @Get('referential')
  @ApiOperation({
    summary: 'Dólar referencial',
    description:
      'Calcula una tasa de referencia ponderada (60% BCV + 40% Binance) que representa un precio medio entre el oficial y el paralelo.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna el dólar referencial con pesos, cálculo explicado y brecha comparativa',
    schema: {
      example: {
        rates: {
          bcv: {
            price: 48.5,
            weight: '60%',
            updatedAt: '2025-01-15T10:00:00.000Z',
          },
          binance: {
            price: 52.1,
            weight: '40%',
            updatedAt: '2025-01-15T10:00:00.000Z',
          },
        },
        referential: {
          price: 49.94,
          calculation: '(48.5 × 0.6 + 52.1 × 0.4) / 2',
          description:
            'Promedio ponderado: 60% BCV (oficial) + 40% Binance (paralelo)',
        },
        comparison: {
          brecha: {
            value: 7.42,
            formatted: '7.42%',
          },
        },
        timestamp: '2025-01-15T10:05:00.000Z',
      },
    },
  })
  getReferential() {
    return this.analiticsService.referenceDollar();
  }

  @Get('volatility')
  @ApiOperation({
    summary: 'Volatilidad histórica',
    description:
      'Calcula la volatilidad (desviación estándar) y rango porcentual de una fuente específica (BCV o Binance) en un período determinado.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna métricas de volatilidad con nivel, interpretación y rango de precios',
    schema: {
      example: {
        source: 'Binance',
        period: 'week',
        summary: {
          dataPoints: 84,
          dateRange: {
            from: '2025-01-08T10:00:00.000Z',
            to: '2025-01-15T10:00:00.000Z',
          },
        },
        metrics: {
          volatility: {
            level: 'MODERATE',
            label: 'Moderada',
            standardDeviation: {
              value: 8.73,
              formatted: '8.73%',
            },
            range: {
              value: 12.4,
              formatted: '12.4%',
              minPrice: 48.5,
              maxPrice: 54.2,
            },
          },
          interpretation: 'El Binance tuvo movimientos moderados',
        },
        timestamp: '2025-01-15T10:05:00.000Z',
      },
    },
  })
  getVolatility(@Query() dto: VolatilityDto) {
    return this.analiticsService.volatility(dto);
  }
}
