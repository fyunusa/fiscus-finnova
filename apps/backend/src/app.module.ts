import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { StorageModule } from '@modules/storage/storage.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { CacheModule } from '@modules/cache/cache.module';
import { QueueModule } from '@modules/queue/queue.module';
import { ExternalApiModule } from '@modules/external-api/external-api.module';
import { FeatureFlagsModule } from '@modules/feature-flags/feature-flags.module';
import { I18nConfigModule } from '@modules/i18n/i18n.module';
import { InvestmentsModule } from '@modules/investments/investments.module';
import { LoansModule } from '@modules/loans/loans.module';
import { InquiryModule } from '@modules/inquiry/inquiry.module';
import { DepositsModule } from '@modules/deposits/deposits.module';
import { ALL_ENTITIES } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    I18nConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USERNAME') || 'fyunusa',
          password: configService.get<string>('DB_PASSWORD') || 'password',
          database: configService.get<string>('DB_DATABASE') || 'fiscus_db',
          entities: ALL_ENTITIES,
          synchronize: false,
          migrations: [],
          logging: !isProduction ? ['error', 'warn'] : false,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    UsersModule,
    AuthModule,
    StorageModule,
    NotificationModule,
    CacheModule,
    QueueModule,
    ExternalApiModule,
    FeatureFlagsModule,
    InvestmentsModule,
    LoansModule,
    InquiryModule,
    DepositsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    console.log('AppModule initialized');
  }
}
