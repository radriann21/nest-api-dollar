import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { request, Agent } from 'undici';
import { APIResponse } from 'src/scrapper/interfaces/interfaces';
import * as cheerio from 'cheerio';

// Permite hacer requests para extraer la data necesaria
@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  private readonly agent = new Agent({
    connect: {
      rejectUnauthorized: false,
    },
  });

  constructor(private readonly configService: ConfigService) {
    this.logger.log('ScrapperService initialized');
  }

  async scrapeWebsite() {
    try {
      const websiteUrl = this.configService.get<string>('WEB_URL')!;
      const response = await request(websiteUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
        dispatcher: this.agent,
      });

      if (response.statusCode !== 200) {
        throw new InternalServerErrorException(
          'Ocurrio un error al obtener los datos',
        );
      }

      const html = await response.body.text();
      const $ = cheerio.load(html);
      const price = Number(
        $('#dolar .centrado strong')
          .text()
          .trim()
          .replace(',', '.')
          .replace('$', ''),
      ).toFixed(2);

      this.logger.log(`Precio actualizado: ${price}`);
      return Number(price);
    } catch (err) {
      this.logger.error('Ocurrio un error en el servidor', err);
      throw new InternalServerErrorException('Ocurrio un error en el servidor');
    }
  }

  async APIRequest() {
    try {
      const apiUrl = this.configService.get<string>('API_URL')!;
      const response = await request(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
        body: JSON.stringify({
          asset: 'USDT',
          fiat: 'VES',
          merchantCheck: true,
          page: 1,
          rows: 15,
          payTypes: ['PagoMovil'],
          publisherType: 'merchant',
          tradeType: 'BUY',
        }),
      });

      if (response.statusCode !== 200) {
        const errorDetail = await response.body.text();
        this.logger.error(
          `Error de API [${response.statusCode}]: ${errorDetail}`,
        );

        throw new InternalServerErrorException(
          `API respondió con status ${response.statusCode}`,
        );
      }

      const data = (await response.body.json()) as APIResponse;

      let totalVolume = 0;
      let weightedSum = 0;
      const priceList: number[] = [];

      const offers = data.data.map((item) => {
        const price = parseFloat(item.adv.price);
        const amount = parseFloat(item.adv.surplusAmount);

        priceList.push(price);

        weightedSum += price * amount;
        totalVolume += amount;

        return {
          price,
          available: amount,
          seller: item.advertiser.nickName,
        };
      });

      // CÁLCULOS MEJORADOS
      const currentPrice = priceList[0];
      const simpleAverage =
        priceList.reduce((a, b) => a + b, 0) / priceList.length;
      const weightedAverage = weightedSum / totalVolume;

      const highestPrice = Math.max(...priceList);
      const lowestPrice = Math.min(...priceList);

      // Variación respecto al promedio (más estable que respecto al mínimo)
      const priceChange = currentPrice - simpleAverage;
      const priceChangePercent = (priceChange / simpleAverage) * 100;

      return {
        currentPrice: Number(currentPrice.toFixed(4)),
        averagePrice: Number(weightedAverage.toFixed(4)),
        highestPrice: Number(highestPrice.toFixed(4)),
        lowestPrice: Number(lowestPrice.toFixed(4)),
        priceChange: Number(priceChange.toFixed(4)),
        priceChangePercent: Number(priceChangePercent.toFixed(2)),
        totalOffers: data.total,
        timestamp: new Date().toISOString(),
        offers,
      };
    } catch (err) {
      this.logger.error('Ocurrio un error en el servidor', err);
      throw new InternalServerErrorException('Ocurrio un error en el servidor');
    }
  }
}
