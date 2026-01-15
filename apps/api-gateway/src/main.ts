import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceProxyConfigs, createProxyOptions } from './lib/proxy-loader';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register all service proxies
  serviceProxyConfigs.forEach((config) => {
    app.use(config.path, createProxyMiddleware(createProxyOptions(config)));
    Logger.log(
      `📡 Registered proxy: ${config.path} -> ${config.target}`,
      'ApiGateway'
    );
  });

  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  initSwagger(app);
  await app.listen(port);

  Logger.log(
    `🚀 API Gateway is running on: http://localhost:${port}/${globalPrefix}`,
    'ApiGateway'
  );
}

bootstrap();

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for the application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
