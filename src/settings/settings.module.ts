import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './settings.entity';
import { SettingsGameCards } from './settings-game-cards.entity';
import { SettingsGameWords } from './settings-game-words.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings, SettingsGameCards, SettingsGameWords]),
    GameModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
