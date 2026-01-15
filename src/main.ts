import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // bloqueia campos extras
      transform: true,        // converte tipos automaticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
