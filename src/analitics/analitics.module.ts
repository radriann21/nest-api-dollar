import { Module } from '@nestjs/common';
import { AnaliticsService } from './analitics.service';
import { AnaliticsController } from './analitics.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Module({
  controllers: [AnaliticsController],
  providers: [AnaliticsService, PrismaService, Logger],
})
export class AnaliticsModule {}
