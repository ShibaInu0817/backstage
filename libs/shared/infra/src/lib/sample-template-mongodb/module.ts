import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  SAMPLE_TEMPLATE_MONGODB_CONFIG_KEY,
  SampleTemplateMongoDbConfig,
} from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [SampleTemplateMongoDbConfig],
      validationOptions: { abortEarly: false },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get(SAMPLE_TEMPLATE_MONGODB_CONFIG_KEY);
        return {
          uri: config.hosts,
          replicaSet: config.replicaSet,
          dbName: config.database,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class SampleTemplateMongodbModule {}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return {
          uri: `mongodb://localhost:27701`,
          dbName: 'test',
          replicaSet: 'mongodb-test',
          maxPoolSize: 50,
          writeConcern: {
            w: 'majority',
            wtimeout: 3000,
          },
        };
      },
    }),
  ],
})
export class TestSampleTemplateMongodbModule {}
