/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const isGeneratingOpenApi = process.env.GENERATE_OPENAPI === 'true';
  const app = await NestFactory.create(AppModule, { 
    abortOnError: !isGeneratingOpenApi,
    preview: isGeneratingOpenApi
  });
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3001;
  const document = initSwagger(app);

  if (isGeneratingOpenApi) {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const outputPath = process.env.OPENAPI_OUTPUT_PATH || path.join(process.cwd(), 'openapi-spec.json');
        fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
        Logger.log(`✅ OpenAPI spec generated at ${outputPath}`, 'MessageService');
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        Logger.error(`❌ Failed to generate OpenAPI spec: ${errorMessage}`, 'MessageService');
    } finally {
        await app.close();
        process.exit(0);
    }
  }

  await app.listen(port);
  Logger.log(`🚀 Message Service is running on: http://localhost:${port}`);
}

bootstrap().catch((err: unknown) => {
  if (process.env.GENERATE_OPENAPI !== 'true') {
    Logger.error(`❌ Bootstrap failed: ${err instanceof Error ? err.message : String(err)}`, 'MessageService');
    process.exit(1);
  }
});

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Message Service')
    .setDescription('Message Service for the application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  return document;
}
