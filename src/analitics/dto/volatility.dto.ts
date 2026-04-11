import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Periods, VolatilitySource } from '../interfaces/interfaces';

export class VolatilityDto {
  @ApiProperty({
    enum: Periods,
    description: 'Período de análisis para calcular la volatilidad',
    example: 'week',
  })
  @IsString()
  period: Periods;

  @ApiProperty({
    enum: VolatilitySource,
    description: 'Fuente de precios a analizar (BCV o Binance)',
    example: 'Binance',
  })
  @IsString()
  source: VolatilitySource;
}
