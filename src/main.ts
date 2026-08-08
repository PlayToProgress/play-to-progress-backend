import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const frontendUrl = config.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl ? frontendUrl.split(',').map((s) => s.trim()) : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.setGlobalPrefix('api');

  const port = config.get<string>('PORT') || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`Play to Progress API listening on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start Play to Progress API:', err);
  process.exit(1);
});
