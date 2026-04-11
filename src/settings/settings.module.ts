import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './settings.entity';
import { SettingsGameRoulette } from './settings-game-roulette.entity';
import { SettingsGamePrisoner } from './settings-game-prisoner.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings, SettingsGameRoulette, SettingsGamePrisoner]),
    GameModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
