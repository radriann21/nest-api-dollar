import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description:
      'Verifica el estado de la API y sus dependencias (base de datos y Redis)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la API',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-04-09T21:00:00.000Z',
        services: {
          database: 'healthy',
          cache: 'healthy',
        },
      },
    },
  })
  async healthCheck() {
    return this.appService.healthCheck();
  }
}
