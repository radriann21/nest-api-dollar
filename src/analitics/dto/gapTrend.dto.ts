import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Periods } from '../interfaces/interfaces';

export class GapTrendDto {
  @ApiProperty({
    enum: Periods,
    description: 'Período histórico para comparar la tendencia',
    example: 'week',
  })
  @IsString()
  period: Periods;
}
