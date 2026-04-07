import { ApiProperty } from '@nestjs/swagger';

export class SourceDto {
  @ApiProperty({
    description: 'ID de la fuente',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la fuente',
    example: 'BCV',
    enum: ['BCV', 'BINANCE'],
  })
  name: string;

  @ApiProperty({
    description: 'Indica si la fuente está activa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Último precio registrado',
    example: '36.5000',
    required: false,
  })
  lastPrice?: string;

  @ApiProperty({
    description: 'Peso de la fuente en cálculos',
    example: 1.0,
  })
  weight: number;
}

export class ExchangeRateDto {
  @ApiProperty({
    description: 'ID del registro de tasa de cambio',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Precio del dólar',
    example: '36.50',
  })
  price: string;

  @ApiProperty({
    description: 'ID de la fuente',
    example: 1,
  })
  sourceId: number;

  @ApiProperty({
    description: 'Información de la fuente',
    type: SourceDto,
    required: false,
  })
  source?: SourceDto;

  @ApiProperty({
    description: 'Tendencia del precio',
    example: 'UP',
    enum: ['UP', 'DOWN', 'STABLE'],
  })
  trend: string;

  @ApiProperty({
    description: 'Variación del precio',
    example: 0.5,
  })
  variantion: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-04-07T22:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización',
    example: '2026-04-07T22:30:00.000Z',
  })
  updatedAt: Date;
}

export class LastRatesDto {
  @ApiProperty({
    description: 'Última tasa del BCV',
    type: ExchangeRateDto,
    required: false,
  })
  bcv: ExchangeRateDto | null;

  @ApiProperty({
    description: 'Última tasa de Binance',
    type: ExchangeRateDto,
    required: false,
  })
  binance: ExchangeRateDto | null;
}
