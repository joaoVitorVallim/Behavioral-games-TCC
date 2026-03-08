import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UuidValidationPipe } from './common/pipes/uuid-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new UuidValidationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Behavioral Games API')
    .setDescription('API for managing sessions and matches of behavioral games')
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication and login')
    .addTag('Users', 'User/teacher management')
    .addTag('Games', 'Information on available games')
    .addTag('Settings', 'Game configurations')
    .addTag('Sessions', 'Game session management')
    .addTag('Players', 'Player/student management')
    .addTag('Matches', 'Match management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log('API running at http://localhost:' + port);
    console.log('Swagger available at http://localhost:' + port + '/api/docs');
  });
}

bootstrap();

