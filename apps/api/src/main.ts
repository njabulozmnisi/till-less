import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { initSentry } from './sentry';
import { SentryExceptionFilter } from './common/sentry.filter';

// Initialize Sentry before app bootstrap
initSentry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
  });

  // Register global exception filter for Sentry
  app.useGlobalFilters(new SentryExceptionFilter());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env['PORT'] || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
