import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { ScrapperModule } from './scrapper/scrapper.module';
import { RatesModule } from './rates/rates.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          stores: [new KeyvRedis(configService.get<string>('REDIS_URL'))],
        };
      },
      isGlobal: true,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TasksModule,
    ScrapperModule,
    RatesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
