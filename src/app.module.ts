import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { ScrapperModule } from './scrapper/scrapper.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TasksModule,
    ScrapperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
