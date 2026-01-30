import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { SettingsModule } from './settings/settings.module';
import { SessionModule } from './session/session.module';
import { PlayerModule } from './player/player.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'nest',
      password: 'nest',
      database: 'nest_db',
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
  ],
})
export class AppModule {}
