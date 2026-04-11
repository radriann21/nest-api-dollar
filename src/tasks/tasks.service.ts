import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ScrapperService } from 'src/scrapper/scrapper.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Permite ejecutar tareas programadas
@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly scrapperService: ScrapperService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger.log('TasksService initialized');
  }

  async onModuleInit() {
    await this.getBCVPrice();
    await this.getAPIPriceAndData();
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async getBCVPrice() {
    try {
      const price = await this.scrapperService.scrapeWebsite();
      this.logger.log(`Precio actualizado: ${JSON.stringify(price)}`);
      await this.savePrice(price, 'BCV');
    } catch (err) {
      this.logger.error('Error al obtener el precio del BCV', err);
      throw new InternalServerErrorException(
        'Error al obtener el precio del BCV',
      );
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async getAPIPriceAndData() {
    try {
      const price = await this.scrapperService.APIRequest();
      this.logger.log(`Precio actualizado: ${JSON.stringify(price)}`);
      await this.savePrice(price.currentPrice, 'Binance');
    } catch (err) {
      this.logger.error('Error al obtener el precio de la API', err);
      throw new InternalServerErrorException(
        'Error al obtener el precio de la API',
      );
    }
  }

  private async savePrice(price: number, source: string) {
    try {
      const sourceData = await this.prisma.sources.findFirst({
        where: { name: source },
      });

      if (!sourceData) {
        this.logger.error(`Fuente no encontrada: ${source}`);
        throw new InternalServerErrorException(
          `Fuente no encontrada: ${source}`,
        );
      }

      const lastPrice = await this.prisma.exchangeRate.findFirst({
        where: { sourceId: sourceData.id },
        orderBy: { createdAt: 'desc' },
      });

      if (price === Number(lastPrice?.price)) {
        this.logger.log('El precio no ha cambiado');
        return;
      }

      let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
      let variation = 0;

      if (lastPrice) {
        const lastPriceValue = Number(lastPrice.price);
        variation = price - lastPriceValue;
        if (variation > 0) {
          trend = 'UP';
        } else if (variation < 0) {
          trend = 'DOWN';
        } else {
          trend = 'STABLE';
        }
      }

      await this.prisma.exchangeRate.create({
        data: {
          price,
          sourceId: sourceData.id,
          trend,
          variantion: variation,
        },
      });

      if (source.toUpperCase() === 'BCV') {
        await this.cacheManager.set('last-bcv-rate', { price });
      } else if (source.toUpperCase() === 'BINANCE') {
        await this.cacheManager.set('last-binance-rate', { price });
      }

      await this.cacheManager.del('last-rates');

      this.logger.log('Precio guardado exitosamente');
    } catch (err) {
      this.logger.error('Error al guardar el precio', err);
      throw new InternalServerErrorException('Error al guardar el precio');
    }
  }
}
