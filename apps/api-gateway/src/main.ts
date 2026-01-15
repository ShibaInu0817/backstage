import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceProxyConfigs, createProxyOptions } from './lib/proxy-loader';

async function bootstrap() {
  const isGeneratingOpenApi = process.env.GENERATE_OPENAPI === 'true';
  const app = await NestFactory.create(AppModule, { 
    abortOnError: !isGeneratingOpenApi,
    preview: isGeneratingOpenApi
  });

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
  const document = initSwagger(app);

  if (isGeneratingOpenApi) {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const outputPath = process.env.OPENAPI_OUTPUT_PATH || path.join(process.cwd(), 'openapi-spec.json');
        fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
        Logger.log(`✅ OpenAPI spec generated at ${outputPath}`, 'ApiGateway');
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        Logger.error(`❌ Failed to generate OpenAPI spec: ${errorMessage}`, 'ApiGateway');
    } finally {
        await app.close();
        process.exit(0);
    }
  }

  await app.listen(port);

  Logger.log(
    `🚀 API Gateway is running on: http://localhost:${port}/${globalPrefix}`,
    'ApiGateway'
  );
}

bootstrap().catch((err: unknown) => {
  if (process.env.GENERATE_OPENAPI !== 'true') {
    Logger.error(`❌ Bootstrap failed: ${err instanceof Error ? err.message : String(err)}`, 'ApiGateway');
    process.exit(1);
  }
});

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for the application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  return document;
}
