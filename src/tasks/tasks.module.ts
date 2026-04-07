import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Logger } from '@nestjs/common';
import { ScrapperService } from 'src/scrapper/scrapper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksController } from './tasks.controller';

@Module({
  providers: [TasksService, Logger, ScrapperService, PrismaService],
  exports: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
