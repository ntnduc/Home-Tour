import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import databaseConfig from './config/database.config';
import { DatabaseConfig } from './config/database.interface';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/client/client.module';
import { ContractModule } from './modules/contract/contract.module';
import { CurrentUserModule } from './modules/current.user';
import { HomepageModule } from './modules/homepage/homepage.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { LocationModule } from './modules/location/location.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PropertyModule } from './modules/property/property.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ReportModule } from './modules/report/report.module';
import { ServicesModule } from './modules/services/services.module';
import { TestModule } from './modules/test/test.module';
import { UploadFileModule } from './modules/upload.file/upload-file.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        if (!dbConfig) {
          throw new Error('Database configuration is not defined');
        }
        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: dbConfig.entities,
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ClientModule,
    AuthModule,
    CurrentUserModule,
    LocationModule,
    PropertyModule,
    ContractModule,
    InvoiceModule,
    PaymentModule,
    TestModule,
    ServicesModule,
    ReportModule,
    HomepageModule,
    RbacModule,
    UploadFileModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
