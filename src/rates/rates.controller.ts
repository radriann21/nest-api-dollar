import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatesService } from './rates.service';
import { ExchangeRateDto, LastRatesDto } from './dto/exchange-rate.dto';

@ApiTags('Rates')
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('last')
  @ApiOperation({
    summary: 'Obtener las últimas tasas de cambio',
    description:
      'Retorna las últimas tasas de cambio del dólar de las fuentes BCV y Binance',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasas obtenidas exitosamente',
    type: LastRatesDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  getLastRates() {
    return this.ratesService.getLastRates();
  }

  @Get('bcv')
  @ApiOperation({
    summary: 'Obtener la última tasa del BCV',
    description:
      'Retorna la última tasa de cambio del dólar según el Banco Central de Venezuela',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasa del BCV obtenida exitosamente',
    type: ExchangeRateDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  getLastBcvRate() {
    return this.ratesService.getLastBcvRate();
  }

  @Get('binance')
  @ApiOperation({
    summary: 'Obtener la última tasa de Binance',
    description: 'Retorna la última tasa de cambio del dólar según Binance P2P',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasa de Binance obtenida exitosamente',
    type: ExchangeRateDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  getLastBinanceRate() {
    return this.ratesService.getLastBinanceRate();
  }
}
