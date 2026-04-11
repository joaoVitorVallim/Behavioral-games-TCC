import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { SettingsModule } from './settings/settings.module';
import { SessionModule } from './session/session.module';
import { PlayerModule } from './player/player.module';
import { MatchModule } from './match/match.module';
import { PrisonerModule } from './prisoner/prisoner.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    UsersModule,
    AuthModule,
    GameModule,
    SettingsModule,
    SessionModule,
    PlayerModule,
    MatchModule,
    PrisonerModule,

  ],
})
export class AppModule {}
