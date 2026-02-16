import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // bloqueia campos extras
      transform: true,        // converte tipos automaticamente
    }),
  );

    const config = new DocumentBuilder()
    .setTitle('Minha API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true, // permite todas as origens em desenvolvimento
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
