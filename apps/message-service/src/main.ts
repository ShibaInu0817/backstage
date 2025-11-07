/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3001;
  initSwagger(app);
  await app.listen(port);
  Logger.log(`🚀 Message Service is running on: http://localhost:${port}`);
}

bootstrap();

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Message Service')
    .setDescription('Message Service for the application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
