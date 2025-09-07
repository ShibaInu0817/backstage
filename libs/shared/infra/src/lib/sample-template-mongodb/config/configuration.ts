import assert from 'node:assert';
import { registerAs } from '@nestjs/config';

export interface MongoDbConfig {
  hosts: string;
  replicaSet: string;
  database: string;
}

export const SAMPLE_TEMPLATE_MONGODB_CONFIG_KEY = 'sampleTemplateMongodb';

export const SampleTemplateMongoDbConfig = registerAs(
  SAMPLE_TEMPLATE_MONGODB_CONFIG_KEY,
  function (): MongoDbConfig {
    assert(
      process.env['SAMPLE_TEMPLATE_MONGODB_HOSTS'],
      'SAMPLE_TEMPLATE_MONGODB_HOSTS is required'
    );
    assert(
      process.env['SAMPLE_TEMPLATE_MONGODB_REPLICA_SET'],
      'SAMPLE_TEMPLATE_MONGODB_REPLICA_SET is required'
    );
    assert(
      process.env['SAMPLE_TEMPLATE_MONGODB_DB_NAME'],
      'SAMPLE_TEMPLATE_MONGODB_DB_NAME is required'
    );

    return {
      hosts: process.env['SAMPLE_TEMPLATE_MONGODB_HOSTS'],
      replicaSet: process.env['SAMPLE_TEMPLATE_MONGODB_REPLICA_SET'],
      database: process.env['SAMPLE_TEMPLATE_MONGODB_DB_NAME'],
    };
  }
);
