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
    .setDescription('API para gerenciamento de sessões e partidas de jogos comportamentais')
    .setVersion('1.0.0')
    .addTag('Auth', 'Autenticação e login')
    .addTag('Users', 'Gerenciamento de usuários/professores')
    .addTag('Games', 'Informações dos jogos disponíveis')
    .addTag('Settings', 'Configurações dos jogos')
    .addTag('Sessions', 'Gerenciamento de sessões de jogo')
    .addTag('Players', 'Gerenciamento de jogadores/alunos')
    .addTag('Matches', 'Gerenciamento de partidas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log('API rodando em http://localhost:' + port);
    console.log('Swagger disponível em http://localhost:' + port + '/api/docs');
  });
}

bootstrap();

