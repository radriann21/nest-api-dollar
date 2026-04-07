import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Module({
  controllers: [RatesController],
  providers: [RatesService, PrismaService, Logger],
})
export class RatesModule {}
